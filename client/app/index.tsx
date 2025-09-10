import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Button,
  useWindowDimensions,
} from "react-native";
import {
  dummyData,
  CommunityReport,
  Suggestion,
  SafetyAlert,
  FairPrice,
} from "./dummyData";

// ===== Genkit AI integration =====
import { initializeGenkit, moderateAndExtract, detectSimilarity } from "./genkit";

// Initialize Genkit AI
initializeGenkit({ aiModel: "gemini" });

// Utility: Convert ISO timestamp → "time ago"
const timeAgo = (timestamp: string): string => {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"reports" | "submit" | "ai">("reports");
  const [searchQuery, setSearchQuery] = useState("");
  const [reports, setReports] = useState<CommunityReport[]>(dummyData.communityWatch.reports);
  const [newReport, setNewReport] = useState("");
  const [newReportLocation, setNewReportLocation] = useState("");
  const [newReportCity, setNewReportCity] = useState("");
  const [newReportCountry, setNewReportCountry] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>(dummyData.communitySuggestions);

  const [userCity, setUserCity] = useState("");
  const [userCountry, setUserCountry] = useState("");
  const { width } = useWindowDimensions();
  const isWide = width > 768;

  // Filter reports, alerts, suggestions, fair prices by user location
  const locationReports = reports
  .filter((r) => {
    if (userCity === "" ) return true;
    return (
      r.city.toLowerCase() === userCity.toLowerCase()
    );
  })
  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // newest first


  const locationAlerts = dummyData.safetyAlerts.filter(
    (a) =>
      a.location.toLowerCase() === userCity.toLowerCase() ||
      a.description.toLowerCase().includes(userCity.toLowerCase())
  );

  const locationSuggestions = suggestions.filter(
    (s) =>
      s.description.toLowerCase().includes(userCity.toLowerCase()) ||
      s.category.toLowerCase().includes(userCity.toLowerCase())
  );

  const locationFairPrices = dummyData.fairPriceChecker
  .filter((item) => {
    // Show items matching city or country (optional)
    const matchCity = item.location ? item.location.toLowerCase() === userCity.toLowerCase() : true;
    const matchQuery = searchQuery ? item.item.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    return matchCity || matchQuery;
  })
  .sort((a, b) => a.fairPrice - b.fairPrice);



  // ===== Submit new report with Genkit moderation & extraction =====
  const handleSubmitReport = async () => {
    if (!newReport.trim()) return;

    try {
      // 1️⃣ Moderate & extract relevant content using Genkit
      const processed = await moderateAndExtract(newReport);
      if (!processed.isSafe) {
        alert("Report contains offensive/irrelevant content and was removed.");
        setNewReport("");
        return;
      }

      const extractedContent = processed.extractedContent || newReport;

      const reportObj: CommunityReport = {
        id: Date.now(),
        report: extractedContent,
        location: newReportLocation || "User submitted",
        city: newReportCity || "Unknown",
        country: newReportCountry || "Unknown",
        timestamp: new Date().toISOString(),
        category: "General",
      };

      // 2️⃣ Check similarity with existing reports in the same location
      let similarCount = 0;
      for (const r of reports) {
        if (r.location.toLowerCase() === reportObj.location.toLowerCase()) {
          const similarity = await detectSimilarity(reportObj.report, r.report);
          if (similarity > 0.8) similarCount++;
        }
      }

      // 3️⃣ Add report to community watch
      setReports([...reports, reportObj]);
      setNewReport("");
      setNewReportLocation("");
      setNewReportCity("");
      setNewReportCountry("");
      setActiveTab("reports");

      // 4️⃣ Promote to safety alert if similar reports >= 3
      if (similarCount >= 3) {
        const existingAlert = dummyData.safetyAlerts.find(
          (alert) =>
            alert.title.toLowerCase() === reportObj.report.toLowerCase() &&
            alert.location.toLowerCase() === reportObj.location.toLowerCase()
        );
        if (existingAlert) {
          existingAlert.level = "High";
          existingAlert.timestamp = new Date().toISOString();
        } else {
          dummyData.safetyAlerts.push({
            id: Date.now(),
            title: reportObj.report,
            location: reportObj.location,
            description: `Multiple similar reports received at this location (${reportObj.city}).`,
            level: "Moderate",
            scamType: "Reported by Community",
            category: "Safety",
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      console.error("Error submitting report:", err);
      alert("Failed to submit report. Try again later.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.grid, isWide && styles.gridWide]}>
        {/* User Location */}
        <View style={[styles.card, isWide && styles.cardWide]}>
          <Text style={styles.title}>Set Your Location</Text>
          <TextInput style={styles.input} placeholder="City" value={userCity} onChangeText={setUserCity} />
          <TextInput style={styles.input} placeholder="Country" value={userCountry} onChangeText={setUserCountry} />
        </View>

        {/* QR Code */}
        <View style={[styles.card, isWide && styles.cardWide]}>
          <Text style={styles.title}>Traveler ID</Text>
          <Image source={{ uri: dummyData.user.qrCode }} style={styles.qr} />
          <Text>Nationality: {dummyData.user.nationality}</Text>
          <Text>ID: {dummyData.user.idNumber}</Text>
          <Text>Blockchain Verified: {dummyData.user.blockchainVerified ? "✅ Yes" : "❌ No"}</Text>
        </View>

        {/* Safety Alerts */}
        <View style={[styles.card, isWide && styles.cardWide]}>
          <Text style={styles.title}>Safety Alerts</Text>
          {locationAlerts.map((alert: SafetyAlert) => (
            <View key={alert.id} style={styles.itemBox}>
              <Text style={styles.subtitle}>{alert.title} - {alert.location}</Text>
              <Text>{alert.description}</Text>
              <Text>Level: {alert.level}</Text>
              <Text>Scam Type: {alert.scamType}</Text>
              <Text>Category: {alert.category}</Text>
              <Text>Posted: {timeAgo(alert.timestamp)}</Text>
            </View>
          ))}
        </View>

        {/* Fair Price Checker */}
        <View style={[styles.card, isWide && styles.cardWide]}>
          <Text style={styles.title}>Fair Price Checker</Text>
          <TextInput
            style={styles.input}
            placeholder="Search items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {locationFairPrices.length === 0 ? (
            <Text>No items found for your location.</Text>
          ) : (
            locationFairPrices.map((item) => (
              <View key={item.id} style={styles.itemBox}>
                <Text>{item.item}: Fair ₹{item.fairPrice}</Text>
                <Text>Category: {item.category}</Text>
                <Text>Location: {item.location}, {item.city}</Text>
              </View>
            ))
          )}
        </View>

        {/* Community Suggestions */}
        <View style={[styles.card, isWide && styles.cardWide]}>
          <Text style={styles.title}>Community Suggestions</Text>
          {locationSuggestions.length === 0 ? (
            <Text>No suggestions for your location.</Text>
          ) : (
            locationSuggestions.map((s) => (
              <View key={s.id} style={styles.itemBox}>
                <Text style={styles.subtitle}>{s.title}</Text>
                <Text>{s.description}</Text>
                <Text>Category: {s.category}</Text>
                <Text>Upvotes: {s.upvotes}</Text>
              </View>
            ))
          )}
        </View>

        {/* Community Watch */}
        <View style={[styles.card, isWide && styles.cardWide]}>
          <Text style={styles.title}>Community Watch</Text>
          <View style={styles.tabRow}>
            <TouchableOpacity onPress={() => setActiveTab("reports")}>
              <Text style={[styles.tab, activeTab === "reports" && styles.activeTab]}>Recent Reports</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab("submit")}>
              <Text style={[styles.tab, activeTab === "submit" && styles.activeTab]}>Submit Report</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab("ai")}>
              <Text style={[styles.tab, activeTab === "ai" && styles.activeTab]}>AI Analysis</Text>
            </TouchableOpacity>
          </View>

          {activeTab === "reports" ? (
            locationReports.map((r) => (
              <View key={r.id} style={styles.itemBox}>
                <Text>• {r.report} ({r.location} – {r.city}, {r.country})</Text>
                <Text>Category: {r.category}</Text>
                <Text>Posted: {timeAgo(r.timestamp)}</Text>
              </View>
            ))
          ) : activeTab === "submit" ? (
            <View>
              <TextInput style={styles.input} placeholder="Enter your report..." value={newReport} onChangeText={setNewReport} />
              <TextInput style={styles.input} placeholder="Enter location..." value={newReportLocation} onChangeText={setNewReportLocation} />
              <TextInput style={styles.input} placeholder="Enter city..." value={newReportCity} onChangeText={setNewReportCity} />
              <TextInput style={styles.input} placeholder="Enter country..." value={newReportCountry} onChangeText={setNewReportCountry} />
              <Button title="Submit Report" onPress={handleSubmitReport} />
            </View>
          ) : (
            <View style={styles.itemBox}>
              <Text>{dummyData.communityWatch.aiAnalysis.summary}</Text>
              <Text>Risk Level: {dummyData.communityWatch.aiAnalysis.riskLevel}</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa", padding: 10 },
  grid: { flexDirection: "column" },
  gridWide: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  card: { backgroundColor: "white", padding: 15, marginVertical: 8, borderRadius: 10, elevation: 2, flexGrow: 1 },
  cardWide: { width: "48%" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, fontWeight: "600", marginBottom: 5 },
  qr: { width: 120, height: 120, marginVertical: 10, alignSelf: "center" },
  itemBox: { padding: 10, marginVertical: 6, backgroundColor: "#f2f2f2", borderRadius: 8, borderWidth: 1, borderColor: "#ddd" },
  tabRow: { flexDirection: "row", marginBottom: 10 },
  tab: { marginRight: 15, fontSize: 16, color: "gray" },
  activeTab: { color: "black", fontWeight: "bold", textDecorationLine: "underline" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 6, padding: 8, marginBottom: 10, backgroundColor: "#fff" },
});
