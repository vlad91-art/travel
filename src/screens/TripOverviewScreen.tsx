import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { TRIP } from '../data/sampleData';
import StatusBadge from '../components/StatusBadge';
import { Sparkle, Cloud, Dot } from '../components/TravelDecorations';

const STATS = [
  { label: 'Days', value: '28', icon: '📅' },
  { label: 'Destinations', value: '4', icon: '📍' },
  { label: 'Flights', value: '7', icon: '✈️' },
  { label: 'Budget', value: '€2,000', icon: '💶' },
  { label: 'Used', value: '62%', icon: '💸' },
  { label: 'Distance', value: '1,240 km', icon: '🗺️' },
];

const DESTINATIONS = [
  { name: 'Jakarta', nights: 3, activities: 4, emoji: '🏙️', color: '#E8F5E9' },
  { name: 'Yogyakarta', nights: 4, activities: 6, emoji: '🛕', color: '#FFF3E0' },
  { name: 'Bali', nights: 8, activities: 14, emoji: '🌴', color: '#E8F5E9' },
  { name: 'Lombok', nights: 5, activities: 9, emoji: '🏖️', color: '#F3E5F5' },
];

function SectionBlock({ title, headerColor, textColor, icon, children }: {
  title: string; headerColor: string; textColor: string; icon: string; children: React.ReactNode;
}) {
  return (
    <View style={[styles.sectionBlock, { backgroundColor: headerColor, borderColor: headerColor }]}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleWrap}>
          <Text style={{ fontSize: 14, marginRight: 6 }}>{icon}</Text>
          <Text style={[styles.sectionTitle, { color: textColor }]}>{title}</Text>
        </View>
      </View>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

export default function TripOverviewScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Trip Overview</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TripSettings')}><Text style={{ fontSize: 22 }}>⋯</Text></TouchableOpacity>
        </View>

        {/* Hero illustration */}
        <View style={styles.heroCard}>
          <View style={styles.heroScene}>
            <View style={styles.sky} />
            <View style={[styles.mountain, styles.mountainBack]} />
            <View style={[styles.mountain, styles.mountainFront]} />
            <View style={styles.templeContainer}>
              <Text style={styles.templeEmoji}>🛕</Text>
            </View>
            <Text style={[styles.sceneDecor, { left: 20, bottom: 20 }]}>🌴</Text>
            <Text style={[styles.sceneDecor, { right: 20, bottom: 20 }]}>🌴</Text>
            <Text style={[styles.sceneDecor, { left: 60, top: 20 }]}>☁️</Text>
            <Text style={[styles.sceneDecor, { right: 80, top: 30 }]}>☁️</Text>
            <Text style={[styles.sceneDecor, { right: 24, top: 18 }]}>☀️</Text>
            <Sparkle color="#FFD700" size={12} style={{ position: 'absolute', left: 40, top: 40 }} />
            <Sparkle color="#FFD700" size={10} style={{ position: 'absolute', right: 50, bottom: 60 }} />
          </View>
        </View>

        {/* Trip info */}
        <View style={styles.tripInfo}>
          <View style={styles.tripHeader}>
            <Text style={styles.tripName}>Java → Bali → Lombok</Text>
            <StatusBadge status="UPCOMING" />
          </View>
          <Text style={styles.tripDates}>May 9 – Jun 5</Text>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {STATS.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Weather overview */}
        <SectionBlock title="WEATHER OVERVIEW" headerColor="#81D4FA" textColor="#0D47A1" icon="☁️">
          <View style={styles.weatherCard}>
            <View style={styles.weatherLeft}>
              <Text style={styles.weatherTemp}>28° – 32°C</Text>
              <Text style={styles.weatherDesc}>Mostly sunny</Text>
              <Text style={styles.weatherLocation}>May in Indonesia</Text>
            </View>
            <View style={styles.weatherRight}>
              <Text style={{ fontSize: 52 }}>☀️</Text>
            </View>
          </View>
        </SectionBlock>

        {/* Destinations list */}
        <SectionBlock title="DESTINATIONS" headerColor="#AED581" textColor="#33691E" icon="📍">
          {DESTINATIONS.map((dest, index) => (
            <TouchableOpacity key={dest.name} onPress={() => navigation.navigate('DestinationDetails')} activeOpacity={0.7}>
              <View style={[styles.destRow, { backgroundColor: dest.color }]}>
                <View style={styles.destEmojiBg}>
                  <Text style={{ fontSize: 24 }}>{dest.emoji}</Text>
                </View>
                <View style={styles.destInfo}>
                  <Text style={styles.destName}>{dest.name}</Text>
                  <View style={styles.destMetaRow}>
                    <Dot color="#999" size={4} style={{ position: 'relative' }} />
                    <Text style={styles.destMeta}>{dest.nights} nights</Text>
                    <Dot color="#999" size={4} style={{ position: 'relative', marginLeft: 8 }} />
                    <Text style={styles.destMeta}>{dest.activities} activities</Text>
                  </View>
                </View>
                <Text style={styles.chevron}>›</Text>
              </View>
              {index < DESTINATIONS.length - 1 && <View style={styles.divider} />}
            </TouchableOpacity>
          ))}
        </SectionBlock>

        {/* Decorative footer */}
        <View style={styles.footerDecor}>
          <Dot color="#BBB" size={5} style={{ position: 'relative' }} />
          <Dot color="#BBB" size={4} style={{ position: 'relative', marginLeft: 8 }} />
          <Sparkle color="#FF9800" size={10} style={{ position: 'relative', marginLeft: 6 }} />
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E8E8E8' },
  scroll: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 28, color: '#1A1A1A', fontWeight: '300' },
  title: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },

  heroCard: { height: 220, overflow: 'hidden' },
  heroScene: { flex: 1, position: 'relative', overflow: 'hidden' },
  sky: { ...StyleSheet.absoluteFillObject, backgroundColor: '#87CEEB' },
  mountain: { position: 'absolute', bottom: 0, borderLeftWidth: 80, borderRightWidth: 80, borderBottomWidth: 130, borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  mountainBack: { left: 60, borderBottomColor: '#66BB6A', borderBottomWidth: 150, borderLeftWidth: 100, borderRightWidth: 100 },
  mountainFront: { right: 60, borderBottomColor: '#4CAF50', borderBottomWidth: 120, borderLeftWidth: 90, borderRightWidth: 90 },
  templeContainer: { position: 'absolute', bottom: 24, left: 0, right: 0, alignItems: 'center' },
  templeEmoji: { fontSize: 72 },
  sceneDecor: { position: 'absolute', fontSize: 28 },

  tripInfo: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  tripHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  tripName: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', flex: 1, marginRight: 12 },
  tripDates: { fontSize: 13, color: '#666' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8, justifyContent: 'space-between' },
  statCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', width: '31%', borderWidth: 1, borderColor: '#F0F0F0', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  statIcon: { fontSize: 22, marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  statLabel: { fontSize: 11, color: '#888', marginTop: 2 },

  sectionBlock: { marginHorizontal: 16, marginTop: 14, borderRadius: 20, overflow: 'hidden', borderWidth: 3 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 12, paddingBottom: 24 },
  sectionTitleWrap: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8 },
  sectionCard: { backgroundColor: '#fff', borderRadius: 16, margin: 4, marginTop: -16, paddingHorizontal: 10, paddingVertical: 10, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: -2 }, elevation: 3 },

  weatherCard: { flexDirection: 'row', alignItems: 'center', padding: 6 },
  weatherLeft: { flex: 1 },
  weatherTemp: { fontSize: 22, fontWeight: '800', color: '#1A1A1A' },
  weatherDesc: { fontSize: 14, color: '#666', marginTop: 4 },
  weatherLocation: { fontSize: 12, color: '#888', marginTop: 4 },
  weatherRight: { alignItems: 'center', justifyContent: 'center' },

  destRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 12, marginVertical: 2 },
  destEmojiBg: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  destInfo: { flex: 1 },
  destName: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  destMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  destMeta: { fontSize: 12, color: '#666' },
  chevron: { fontSize: 22, color: '#CCC', fontWeight: '300' },
  divider: { height: 1, backgroundColor: '#F5F5F5', marginLeft: 60 },

  footerDecor: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16 },
});
