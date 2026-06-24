import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { TRIP, TODAY_ACTIVITIES, BUDGET } from '../data/sampleData';
import CartoonIcon from '../components/CartoonIcon';
import StatusBadge from '../components/StatusBadge';
import BudgetDonut from '../components/BudgetDonut';
import { Sparkle, Cloud, Dot } from '../components/TravelDecorations';
import { STATUS_BG } from '../data/colors';

// TODO: replace with local asset
function WalletEmoji() {
  return <Text style={{ fontSize: 28 }}>👛</Text>;
}

const { width } = Dimensions.get('window');
const HERO_H = 200;

const QUICK_PILLS = [
  { label: 'Packing', emoji: '🎒', screen: 'Packing' as const, color: '#4CAF50' },
  { label: 'Documents', emoji: '📁', screen: 'Documents' as const, color: '#FF9800' },
  { label: 'Accommodation', emoji: '🏠', screen: 'Accommodation' as const, color: '#9C27B0' },
  { label: 'Transport', emoji: '✈️', screen: 'Transport' as const, color: '#2196F3' },
  { label: 'Memories', emoji: '🎉', screen: 'MemoriesRecap' as const, color: '#FF9800' },
  { label: 'Trip Settings', emoji: '⚙️', screen: 'TripSettings' as const, color: '#666' },
];

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 14 && Math.abs(gs.dy) < 30,
      onPanResponderRelease: (_, gs) => {
        if (gs.dx < -60) navigation.navigate('MyTrips');
      },
    })
  ).current;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── HERO BLOCK ── */}
        <View style={styles.heroBlock}>
          <View style={styles.heroScene}>
            <View style={styles.heroBgSky} />
            <View style={styles.heroBgGround} />
            <View style={[styles.heroHill, { left: -10, backgroundColor: '#66BB6A' }]} />
            <View style={[styles.heroHill, { right: -10, backgroundColor: '#81C784', width: 160 }]} />
            <View style={styles.heroLandmarkWrap}>
              <Text style={styles.heroLandmarkEmoji}>🛕</Text>
            </View>
            <Text style={[styles.heroDecor, { left: 18, top: 16 }]}>☁️</Text>
            <Text style={[styles.heroDecor, { left: 80, top: 22 }]}>☁️</Text>
            <Text style={[styles.heroDecor, { right: 18, top: 14 }]}>☀️</Text>
            <Text style={[styles.heroDecor, { left: 14, bottom: 52 }]}>🌴</Text>
            <Text style={[styles.heroDecor, { right: 16, bottom: 56 }]}>🌴</Text>
            <Sparkle color="#FFD700" size={12} style={{ position: 'absolute', left: 46, top: 34 }} />
            <Sparkle color="#FFD700" size={10} style={{ position: 'absolute', right: 54, top: 28 }} />
          </View>

          <TouchableOpacity
            style={styles.heroBell}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 20 }}>🔔</Text>
            <View style={styles.bellDot} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tripCard}
            onPress={() => navigation.navigate('TripOverview')}
            activeOpacity={0.88}
          >
            <View style={styles.tripCardInner}>
              <TouchableOpacity
                onPress={() => navigation.navigate('ProfileSettings')}
                activeOpacity={0.8}
                style={styles.tripAvatarWrap}
              >
                <View style={styles.tripAvatar}>
                  <Text style={{ fontSize: 22 }}>👨</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.tripCardLeft}>
                <Text style={styles.tripName}>{TRIP.name}</Text>
                <View style={styles.tripDayRow}>
                  <View style={styles.tripDayDot} />
                  <Text style={styles.tripDayText}>Day {TRIP.currentDay} of {TRIP.totalDays}</Text>
                </View>
                <View style={styles.tripLocRow}>
                  <Text style={styles.tripLocIcon}>📍</Text>
                  <Text style={styles.tripLocText}>{TRIP.location}</Text>
                  <View style={styles.tripWeather}>
                    <Text style={{ fontSize: 13 }}>☀️</Text>
                    <Text style={styles.tripTemp}>{TRIP.temperature}°C</Text>
                  </View>
                </View>
              </View>
              <View style={styles.tripCardChevron}>
                <Text style={styles.tripChevronText}>›</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Swipe hint */}
        <View style={styles.swipeHintRow}>
          <Text style={styles.swipeHintText}>← swipe for My Trips</Text>
        </View>

        {/* ── QUICK ACCESS GRID (no scroll) ── */}
        <View style={styles.gridWrap}>
          {QUICK_PILLS.map((pill) => (
            <TouchableOpacity
              key={pill.label}
              style={[styles.gridTile, { backgroundColor: pill.color + '18', borderColor: pill.color + '40' }]}
              onPress={() => navigation.navigate(pill.screen)}
              activeOpacity={0.75}
            >
              <View style={[styles.gridIconCircle, { backgroundColor: pill.color + '30' }]}>
                <Text style={styles.gridEmoji}>{pill.emoji}</Text>
              </View>
              <Text style={[styles.gridLabel, { color: pill.color }]}>{pill.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── TODAY'S ACTIVITIES ── */}
        <SectionBlock
          title="TODAY'S ACTIVITIES"
          headerColor="#C8E6C9"
          textColor="#1B5E20"
          right={<Text style={styles.seeAll}>See all</Text>}
        >
          {TODAY_ACTIVITIES.map((activity) => (
            <View
              key={activity.id}
              style={[styles.activityCard, { backgroundColor: STATUS_BG[activity.status] ?? '#fff' }]}
            >
              <View style={styles.activityTimeCol}>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
              <CartoonIcon emoji={activity.icon} bg={activity.iconBg} size={46} />
              <View style={styles.activityTextCol}>
                <Text style={styles.activityTitle} numberOfLines={1}>{activity.title}</Text>
                {activity.subtitle ? (
                  <Text style={styles.activitySub} numberOfLines={1}>{activity.subtitle}</Text>
                ) : null}
              </View>
              <StatusBadge status={activity.status} small />
            </View>
          ))}
        </SectionBlock>

        {/* ── BUDGET SNAPSHOT ── */}
        <SectionBlock
          title="BUDGET SNAPSHOT"
          headerColor="#C8E6C9"
          textColor="#1B5E20"
          right={<Sparkle color="#1B5E20" size={14} style={{ position: 'relative' }} />}
        >
          <View style={styles.budgetCard}>
            <View style={styles.budgetLeft}>
              <BudgetDonut percentage={BUDGET.percentUsed} size={108} strokeWidth={12} />
            </View>
            <View style={styles.budgetRight}>
              <BudgetRow label="Total budget" value={`€${BUDGET.total.toLocaleString()}`} dotColor="#1A1A1A" />
              <BudgetRow label="Spent so far" value={`€${BUDGET.spent.toLocaleString()}`} dotColor="#4CAF50" />
              <BudgetRow label="Today's spending" value={`€${BUDGET.todaySpending}`} dotColor="#FF9800" />
              <View style={styles.partnerRow}>
                <Text style={styles.partnerText}>
                  Raul owes you <Text style={styles.partnerAmt}>€{BUDGET.partnerOwes}</Text>
                  {'  💛'}
                </Text>
              </View>
            </View>
            <View style={styles.walletEmojiWrap}>
              <WalletEmoji />
            </View>
          </View>
        </SectionBlock>

        {/* Footer */}
        <View style={styles.footerDecor}>
          <Dot color="#DDD" size={5} style={{ position: 'relative' }} />
          <Dot color="#DDD" size={4} style={{ position: 'relative', marginLeft: 8 }} />
          <Dot color="#DDD" size={6} style={{ position: 'relative', marginLeft: 6 }} />
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionBlock({
  title,
  headerColor,
  textColor,
  right,
  children,
}: {
  title: string;
  headerColor: string;
  textColor: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionBlock}>
      <View style={[styles.sectionHeader, { backgroundColor: headerColor }]}>
        <View style={styles.sectionTitleWrap}>
          <Sparkle color={textColor} size={12} style={{ position: 'relative', marginRight: 6 }} />
          <Text style={[styles.sectionTitle, { color: textColor }]}>{title}</Text>
        </View>
        {right}
      </View>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function BudgetRow({ label, value, dotColor }: { label: string; value: string; dotColor: string }) {
  return (
    <View style={styles.budgetRow}>
      <View style={[styles.budgetDot, { backgroundColor: dotColor }]} />
      <View>
        <Text style={styles.budgetLabel}>{label}</Text>
        <Text style={styles.budgetValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E8E8E8' },
  scroll: { flex: 1 },

  /* ── HERO ── */
  heroBlock: {
    position: 'relative',
    marginBottom: 68,
  },
  heroScene: {
    height: HERO_H,
    overflow: 'hidden',
    position: 'relative',
  },
  heroBgSky: { ...StyleSheet.absoluteFillObject, backgroundColor: '#81D4FA' },
  heroBgGround: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 48, backgroundColor: '#A5D6A7',
  },
  heroHill: {
    position: 'absolute', bottom: 0, width: 140, height: 80, borderRadius: 60,
  },
  heroLandmarkWrap: {
    position: 'absolute',
    bottom: 28,
    left: 0, right: 0,
    alignItems: 'center',
  },
  heroLandmarkEmoji: { fontSize: 80 },
  heroDecor: { position: 'absolute', fontSize: 22 },

  heroBell: {
    position: 'absolute',
    top: 14,
    right: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center', justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute', top: 6, right: 6,
    width: 9, height: 9, borderRadius: 4.5,
    backgroundColor: '#FF5252', borderWidth: 1.5, borderColor: '#fff',
  },

  tripCard: {
    position: 'absolute',
    bottom: -52,
    left: 16, right: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  tripCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 14,
    paddingVertical: 12,
    paddingLeft: 10,
    gap: 10,
  },
  tripAvatarWrap: { alignSelf: 'flex-start', marginTop: -22 },
  tripAvatar: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: '#FFF9C4',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#fff',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
  },
  tripCardLeft: { flex: 1 },
  tripName: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', marginBottom: 5 },
  tripDayRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
  tripDayDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50' },
  tripDayText: { fontSize: 13, fontWeight: '600', color: '#4CAF50' },
  tripLocRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tripLocIcon: { fontSize: 13 },
  tripLocText: { fontSize: 13, color: '#666', fontWeight: '500', flex: 1 },
  tripWeather: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  tripTemp: { fontSize: 13, fontWeight: '600', color: '#FF9800' },
  tripCardChevron: { paddingLeft: 4 },
  tripChevronText: { fontSize: 26, color: '#CCC', fontWeight: '300' },

  swipeHintRow: { alignItems: 'flex-end', paddingRight: 16, marginTop: 56, marginBottom: 0 },
  swipeHintText: { fontSize: 10, color: '#999', fontStyle: 'italic' },

  /* ── GRID (no scroll) ── */
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    justifyContent: 'space-between',
  },
  gridTile: {
    width: (width - 16 * 2 - 8 * 2) / 3,
    aspectRatio: 1,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  gridIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridEmoji: { fontSize: 24 },
  gridLabel: { fontSize: 12, fontWeight: '700', textAlign: 'center' },

  /* ── SECTION BLOCK ── */
  sectionBlock: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#C8E6C9',
    borderWidth: 3,
    borderColor: '#C8E6C9',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 24,
  },
  sectionTitleWrap: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8 },
  seeAll: { fontSize: 13, fontWeight: '600', color: '#1B5E20' },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 4,
    marginTop: -16,
    paddingHorizontal: 10,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 3,
  },

  /* Activities inside */
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  activityTimeCol: { width: 40, alignItems: 'flex-start' },
  activityTime: { fontSize: 12, fontWeight: '600', color: '#666' },
  activityTextCol: { flex: 1 },
  activityTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  activitySub: { fontSize: 12, color: '#888', marginTop: 2 },

  /* Budget */
  budgetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  budgetLeft: { alignItems: 'center', justifyContent: 'center' },
  budgetRight: { flex: 1 },
  walletEmojiWrap: { position: 'absolute', top: -4, right: 0 },
  budgetRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  budgetDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4, flexShrink: 0 },
  budgetLabel: { fontSize: 11, color: '#888', marginBottom: 1 },
  budgetValue: { fontSize: 15, fontWeight: '800', color: '#1A1A1A' },
  partnerRow: { marginTop: 2 },
  partnerText: { fontSize: 12, color: '#666' },
  partnerAmt: { fontWeight: '700', color: '#FF9800' },

  footerDecor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
});
