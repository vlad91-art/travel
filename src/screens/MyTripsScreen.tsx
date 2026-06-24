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
import { Sparkle, Dot, Cloud } from '../components/TravelDecorations';

const TRIPS = [
  {
    id: 'current',
    name: 'Java → Bali → Lombok',
    dates: 'May 9 – Jun 5, 2025',
    days: 28,
    destinations: 4,
    budget: '€2,000',
    spent: '€1,240',
    status: 'IN PROGRESS' as const,
    emoji: '🛕',
    heroBg: '#E8F5E9',
    active: true,
  },
  {
    id: 'past1',
    name: 'Paris & Rome',
    dates: 'Mar 14 – Mar 24, 2024',
    days: 10,
    destinations: 2,
    budget: '€1,500',
    spent: '€1,480',
    status: 'COMPLETED' as const,
    emoji: '🗼',
    heroBg: '#F3E5F5',
    active: false,
  },
  {
    id: 'past2',
    name: 'Tokyo',
    dates: 'Nov 5 – Nov 16, 2023',
    days: 11,
    destinations: 1,
    budget: '€2,200',
    spent: '€2,050',
    status: 'COMPLETED' as const,
    emoji: '⛩️',
    heroBg: '#FCE4EC',
    active: false,
  },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  'IN PROGRESS': { bg: '#E8F5E9', text: '#4CAF50' },
  COMPLETED: { bg: '#F5F5F5', text: '#888' },
};

export default function MyTripsScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Trips</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('CreateTrip')}
          activeOpacity={0.8}
        >
          <Text style={styles.addBtnText}>＋</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Active trip */}
        <View style={styles.groupLabel}>
          <Sparkle color="#4CAF50" size={12} style={{ position: 'relative', marginRight: 4 }} />
          <Text style={styles.groupLabelText}>ACTIVE TRIP</Text>
        </View>
        <TripCard
          trip={TRIPS[0]}
          onPress={() => navigation.navigate('HomeMain')}
        />

        {/* Past trips */}
        <View style={[styles.groupLabel, { marginTop: 10 }]}>
          <Cloud size={16} style={{ position: 'relative', marginRight: 4 }} />
          <Text style={styles.groupLabelText}>PAST TRIPS</Text>
        </View>
        {TRIPS.slice(1).map((trip) => (
          <TripCard key={trip.id} trip={trip} onPress={() => {}} />
        ))}

        <View style={styles.footerDecor}>
          <Dot color="#DDD" size={5} style={{ position: 'relative' }} />
          <Dot color="#DDD" size={4} style={{ position: 'relative', marginLeft: 8 }} />
          <Sparkle color="#FF9800" size={10} style={{ position: 'relative', marginLeft: 6 }} />
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function TripCard({
  trip,
  onPress,
}: {
  trip: typeof TRIPS[0];
  onPress: () => void;
}) {
  const statusStyle = STATUS_COLORS[trip.status];
  return (
    <TouchableOpacity
      style={[styles.tripCard, trip.active && styles.tripCardActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Hero illustration */}
      <View style={[styles.tripHero, { backgroundColor: trip.heroBg }]}>
        {/* Sky + green hills */}
        <View style={styles.heroSky} />
        <View style={[styles.heroHill, { left: -10, bottom: 0, backgroundColor: '#66BB6A' }]} />
        <View style={[styles.heroHill, { right: -10, bottom: 0, backgroundColor: '#81C784', width: 120 }]} />
        <Text style={styles.heroEmoji}>{trip.emoji}</Text>
        <Text style={[styles.heroDecor, { left: 12, top: 10 }]}>☁️</Text>
        <Text style={[styles.heroDecor, { right: 18, top: 8 }]}>☀️</Text>
        <Text style={[styles.heroDecor, { left: 10, bottom: 8 }]}>🌴</Text>
        <Text style={[styles.heroDecor, { right: 12, bottom: 8 }]}>🌴</Text>
        {/* Status badge on hero */}
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: statusStyle.text }]} />
          <Text style={[styles.statusText, { color: statusStyle.text }]}>{trip.status}</Text>
        </View>
      </View>

      {/* Info section */}
      <View style={styles.tripInfo}>
        <Text style={styles.tripName}>{trip.name}</Text>
        <Text style={styles.tripDates}>{trip.dates}</Text>

        <View style={styles.statsRow}>
          <Stat label="days" value={String(trip.days)} />
          <View style={styles.statDivider} />
          <Stat label="destinations" value={String(trip.destinations)} />
          <View style={styles.statDivider} />
          <Stat label="budget" value={trip.budget} />
        </View>

        {trip.active && (
          <View style={styles.spentRow}>
            <Text style={styles.spentLabel}>Spent: </Text>
            <Text style={styles.spentValue}>{trip.spent}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
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
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { fontSize: 20, color: '#fff', lineHeight: 24, fontWeight: '700' },

  scroll: { flex: 1, padding: 16 },

  groupLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  groupLabelText: { fontSize: 12, fontWeight: '700', color: '#888', letterSpacing: 0.8 },

  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  tripCardActive: {
    borderColor: '#A5D6A7',
    borderWidth: 1.5,
  },

  tripHero: {
    height: 120,
    position: 'relative',
    overflow: 'hidden',
  },
  heroSky: { ...StyleSheet.absoluteFillObject, backgroundColor: '#B3E5FC' },
  heroHill: {
    position: 'absolute',
    width: 140,
    height: 60,
    borderRadius: 40,
    bottom: 0,
  },
  heroEmoji: {
    position: 'absolute',
    bottom: 10,
    left: '50%',
    fontSize: 44,
    marginLeft: -22,
  },
  heroDecor: { position: 'absolute', fontSize: 18 },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },

  tripInfo: { padding: 16 },
  tripName: { fontSize: 17, fontWeight: '800', color: '#1A1A1A', marginBottom: 2 },
  tripDates: { fontSize: 13, color: '#888', marginBottom: 12 },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 10,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 15, fontWeight: '800', color: '#1A1A1A' },
  statLabel: { fontSize: 10, color: '#888', marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: '#E0E0E0' },

  spentRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  spentLabel: { fontSize: 12, color: '#888' },
  spentValue: { fontSize: 14, fontWeight: '700', color: '#4CAF50' },

  footerDecor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
});
