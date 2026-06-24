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
import { BUDGET, BUDGET_CATEGORIES } from '../data/sampleData';
import BudgetDonut from '../components/BudgetDonut';
import { Sparkle, Cloud, Dot } from '../components/TravelDecorations';
import { PASTEL } from '../data/colors';

// TODO: replace with local asset
function WalletEmoji() {
  return <Text style={{ fontSize: 40 }}>👛</Text>;
}

// TODO: replace with local asset
function CategoryIcon({ color }: { color: string }) {
  return (
    <View style={[styles.catIcon, { backgroundColor: color }]}>
      <Text style={{ fontSize: 10, color: '#fff', fontWeight: '800' }}>■</Text>
    </View>
  );
}

// TODO: replace with local asset
function NoodleEmoji() {
  return <Text style={{ fontSize: 28 }}>🍜</Text>;
}

const CATEGORY_PASTEL_BG: Record<string, string> = {
  Food: PASTEL.food,
  Transport: PASTEL.flights,
  Accommodation: PASTEL.accommodation,
  Activities: PASTEL.activities,
  Shopping: PASTEL.shopping,
};

export default function BudgetScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── TOTAL BUDGET CARD ── */}
        <View style={styles.totalCard}>
          <View style={styles.totalLeft}>
            <Text style={styles.totalAmount}>€{BUDGET.total.toLocaleString()}</Text>
            <Text style={styles.totalSub}>Total budget</Text>
          </View>
          <WalletEmoji />
        </View>

        {/* ── PROGRESS CARD (donut + stats) ── */}
        <View style={styles.progressCard}>
          <View style={styles.progressLeft}>
            <BudgetDonut percentage={BUDGET.percentUsed} size={130} strokeWidth={15} />
          </View>
          <View style={styles.progressRight}>
            <ProgressRow
              color="#4CAF50"
              label="Spent so far"
              value={`€${BUDGET.spent.toLocaleString()}`}
            />
            <View style={styles.rowDivider} />
            <ProgressRow
              color="#FF9800"
              label="Remaining"
              value={`€${BUDGET.remaining}`}
            />
          </View>
        </View>

        {/* ── BY CATEGORY ── */}
        <SectionBlock
          title="BY CATEGORY"
          headerColor="#AED581"
          textColor="#33691E"
          right={null}
        >
          {BUDGET_CATEGORIES.map((cat) => {
            const bg = CATEGORY_PASTEL_BG[cat.name] ?? '#fff';
            return (
              <View key={cat.name} style={[styles.catCard, { backgroundColor: bg }]}>
                <CategoryIcon color={cat.color} />
                <View style={styles.catContent}>
                  <View style={styles.catHeaderRow}>
                    <Text style={styles.catName}>{cat.name}</Text>
                    <Text style={styles.catAmount}>€{cat.spent}</Text>
                    <Text style={styles.catPercent}>{cat.percentage}%</Text>
                  </View>
                  <View style={styles.progressBg}>
                    <View
                      style={[styles.progressFill, { width: `${cat.percentage}%`, backgroundColor: cat.color }]}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </SectionBlock>

        {/* ── RECENT EXPENSES ── */}
        <SectionBlock
          title="RECENT EXPENSES"
          headerColor="#90CAF9"
          textColor="#0D47A1"
          right={<Text style={[styles.seeAll, { color: '#0D47A1' }]}>See all</Text>}
        >
          <TouchableOpacity
            style={styles.expenseRow}
            onPress={() => navigation.navigate('ExpenseDetails')}
            activeOpacity={0.7}
          >
            <NoodleEmoji />
            <View style={styles.expenseInfo}>
              <Text style={styles.expenseName}>Lunch Jejamuran</Text>
              <Text style={styles.expenseTime}>Today, 13:30</Text>
            </View>
            <Text style={styles.expenseAmount}>€12</Text>
          </TouchableOpacity>
        </SectionBlock>

        {/* Footer */}
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

function ProgressRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <View style={styles.progressRow}>
      <View style={[styles.progressDot, { backgroundColor: color }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressValue}>{value}</Text>
      </View>
    </View>
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
  right: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.sectionBlock, { backgroundColor: headerColor, borderColor: headerColor }]}>
      <View style={styles.sectionHeader}>
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E8E8E8' },
  scroll: { flex: 1 },

  /* Total budget card */
  totalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  totalLeft: { flex: 1 },
  totalAmount: { fontSize: 52, fontWeight: '900', color: '#1A1A1A', lineHeight: 56 },
  totalSub: { fontSize: 14, color: '#888', marginTop: 4 },

  /* Progress card — donut LEFT, stats RIGHT */
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 8,
  },
  progressLeft: { alignItems: 'center', justifyContent: 'center' },
  progressRight: { flex: 1 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 },
  progressDot: { width: 11, height: 11, borderRadius: 5.5, flexShrink: 0 },
  progressLabel: { fontSize: 12, color: '#888', marginBottom: 1 },
  progressValue: { fontSize: 17, fontWeight: '800', color: '#1A1A1A' },
  rowDivider: { height: 1, backgroundColor: '#F5F5F5', marginLeft: 21 },

  /* ── SECTION BLOCK ── */
  sectionBlock: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 3,
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
  seeAll: { fontSize: 13, fontWeight: '600' },
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

  /* Category cards */
  catCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  catIcon: {
    width: 22,
    height: 22,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catContent: { flex: 1 },
  catHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  catName: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', flex: 1 },
  catAmount: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginRight: 8 },
  catPercent: { fontSize: 12, color: '#888', width: 32, textAlign: 'right' },
  progressBg: { height: 6, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },

  /* Recent expenses */
  expenseRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  expenseInfo: { flex: 1 },
  expenseName: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  expenseTime: { fontSize: 12, color: '#888', marginTop: 2 },
  expenseAmount: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },

  footerDecor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
});
