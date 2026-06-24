import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { JOURNAL_ENTRIES } from '../data/sampleData';
import BottomSheet, { SheetButton, MenuSheet } from '../components/BottomSheet';
import { Sparkle, Cloud, Dot, TravelStamp } from '../components/TravelDecorations';

const FILTER_TABS = ['All', 'Notes', 'Photos', 'Places'];

const ACTIVITY_LINKS = [
  'Borobudur Temple',
  'Lunch at Jejamuran',
  'Transfer to Airport',
  'Prambanan Temple',
];

interface LocalEntry {
  id: string;
  location: string;
  time: string;
  note: string;
  photoUrl?: string;
  day: number;
  dayLabel: string;
  emoji: string;
  linkedActivity?: string;
  photosCount: number;
}

function mapToLocal(e: typeof JOURNAL_ENTRIES[0]): LocalEntry {
  return {
    ...e,
    photosCount: e.day === 8 && e.id === '1' ? 3 : e.photoUrl ? 2 : 0,
  };
}

export default function JournalScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [entries, setEntries] = useState<LocalEntry[]>(JOURNAL_ENTRIES.map(mapToLocal));

  // Add form state
  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newLinkedActivity, setNewLinkedActivity] = useState('');

  const handleSave = () => {
    if (!newTitle.trim()) return;
    const entry: LocalEntry = {
      id: Date.now().toString(),
      location: newLocation || newTitle,
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      note: newText,
      day: 8,
      dayLabel: 'Today · Day 8',
      emoji: '📝',
      linkedActivity: newLinkedActivity || undefined,
      photosCount: 0,
    };
    setEntries((prev) => [entry, ...prev]);
    setNewTitle('');
    setNewText('');
    setNewLocation('');
    setNewLinkedActivity('');
    setShowAddModal(false);
  };

  const filtered = entries.filter((e) => {
    if (activeFilter === 'Photos') return e.photosCount > 0;
    if (activeFilter === 'Notes') return e.note.length > 0;
    return true;
  }).filter((e) =>
    searchText
      ? e.location.toLowerCase().includes(searchText.toLowerCase()) ||
        e.note.toLowerCase().includes(searchText.toLowerCase())
      : true
  );

  const day8 = filtered.filter((e) => e.day === 8);
  const day7 = filtered.filter((e) => e.day === 7);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Sparkle color="#FF9800" size={14} style={{ position: 'relative', marginRight: 6 }} />
          <Text style={styles.title}>Journal</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setSearchOpen((v) => !v)}>
            <Text style={{ fontSize: 20 }}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowAddModal(true)}>
            <Text style={{ fontSize: 22, color: '#4CAF50', fontWeight: '700' }}>＋</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setMenuVisible(true)}>
            <Text style={{ fontSize: 20 }}>⋯</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search bar (collapsible) */}
      {searchOpen && (
        <View style={styles.searchBar}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search journal…"
            placeholderTextColor="#C0C0C0"
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        contentContainerStyle={styles.tabScrollContent}
      >
        {FILTER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterTab, activeFilter === tab && styles.filterTabActive]}
            onPress={() => setActiveFilter(tab)}
          >
            <Text style={[styles.filterTabText, activeFilter === tab && styles.filterTabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {day8.length > 0 && (
          <DayGroup label="Today · Day 8" entries={day8} accent="#FF9800" headerColor="#FFF8E1" textColor="#E65100" />
        )}
        {day7.length > 0 && (
          <DayGroup label="Yesterday · Day 7" entries={day7} accent={undefined} headerColor="#E8F5E9" textColor="#2E7D32" />
        )}

        <View style={styles.footerDecor}>
          <Dot color="#DDD" size={5} style={{ position: 'relative' }} />
          <Dot color="#DDD" size={4} style={{ position: 'relative', marginLeft: 8 }} />
          <Sparkle color="#FF9800" size={10} style={{ position: 'relative', marginLeft: 6 }} />
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ⋯ Menu */}
      <MenuSheet
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        items={[
          { label: 'Sort by date', icon: '📅', onPress: () => {} },
          { label: 'Export journal', icon: '📤', onPress: () => {} },
          { label: 'Delete all entries', icon: '🗑️', onPress: () => {}, danger: true },
        ]}
      />
      {/* Add Journal Entry Modal */}
      <BottomSheet visible={showAddModal} onClose={() => setShowAddModal(false)} title="New Journal Entry">
        <Text style={styles.fieldLabel}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Sunrise at Borobudur"
          placeholderTextColor="#C0C0C0"
          value={newTitle}
          onChangeText={setNewTitle}
        />

        <Text style={styles.fieldLabel}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Write about your experience…"
          placeholderTextColor="#C0C0C0"
          value={newText}
          onChangeText={setNewText}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.fieldLabel}>Location</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Yogyakarta"
          placeholderTextColor="#C0C0C0"
          value={newLocation}
          onChangeText={setNewLocation}
        />

        <Text style={styles.fieldLabel}>
          Link to activity <Text style={styles.optionalLabel}>(optional)</Text>
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.activityChips}
        >
          {ACTIVITY_LINKS.map((act) => (
            <TouchableOpacity
              key={act}
              style={[styles.actChip, newLinkedActivity === act && styles.actChipActive]}
              onPress={() => setNewLinkedActivity(newLinkedActivity === act ? '' : act)}
            >
              <Text style={[styles.actChipText, newLinkedActivity === act && styles.actChipTextActive]}>
                {act}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.fieldLabel}>
          Photos <Text style={styles.optionalLabel}>(optional)</Text>
        </Text>
        <TouchableOpacity style={styles.photoUploadBtn}>
          <Text style={{ fontSize: 22 }}>📸</Text>
          <Text style={styles.photoUploadText}>Add photos</Text>
        </TouchableOpacity>

        <SheetButton label="Save Entry" onPress={handleSave} disabled={!newTitle.trim()} />
      </BottomSheet>
    </SafeAreaView>
  );
}

function DayGroup({ label, entries, accent, headerColor, textColor }: { label: string; entries: LocalEntry[]; accent?: string; headerColor: string; textColor: string }) {
  return (
    <View style={[styles.sectionBlock, { borderColor: headerColor }]}>
      <View style={[styles.sectionHeader, { backgroundColor: headerColor }]}>
        <View style={styles.sectionTitleWrap}>
          <Sparkle color={textColor} size={12} style={{ position: 'relative', marginRight: 6 }} />
          <Text style={[styles.sectionTitle, { color: textColor }]}>{label.toUpperCase()}</Text>
        </View>
        {accent ? (
          <TravelStamp label="MEMORIES" color={accent} style={{ position: 'relative', transform: [] }} />
        ) : (
          <Cloud size={16} color={textColor} style={{ position: 'relative' }} />
        )}
      </View>
      <View style={styles.sectionCard}>
        {entries.map((entry) => (
          <JournalCard key={entry.id} entry={entry} />
        ))}
      </View>
    </View>
  );
}

function JournalCard({ entry }: { entry: LocalEntry }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      {/* Thumbnail */}
      <View style={styles.thumbWrap}>
        {entry.photoUrl ? (
          <Image source={{ uri: entry.photoUrl }} style={styles.thumb} resizeMode="cover" />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]}>
            <Text style={{ fontSize: 32 }}>{entry.emoji}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardLocation} numberOfLines={1}>{entry.location}</Text>
          <Text style={styles.cardTime}>{entry.time}</Text>
        </View>

        {/* Linked activity chip */}
        {entry.linkedActivity ? (
          <View style={styles.linkedChip}>
            <Text style={{ fontSize: 10 }}>📍</Text>
            <Text style={styles.linkedChipText} numberOfLines={1}>{entry.linkedActivity}</Text>
          </View>
        ) : null}

        <Text style={styles.cardNote} numberOfLines={2}>{entry.note}</Text>

        {entry.photosCount > 0 ? (
          <Text style={styles.photosCount}>{entry.photosCount} photos</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E8E8E8' },

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
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: '#1A1A1A' },
  headerIcons: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 4 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearSearch: { fontSize: 16, color: '#888', marginLeft: 8, padding: 4 },

  tabScroll: { backgroundColor: '#fff', maxHeight: 52 },
  tabScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
  },
  filterTab: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  filterTabActive: { backgroundColor: '#4CAF50' },
  filterTabText: { fontSize: 14, fontWeight: '600', color: '#666' },
  filterTabTextActive: { color: '#fff' },

  scroll: { flex: 1, padding: 16 },

  /* ── SECTION BLOCK ── */
  sectionBlock: {
    marginBottom: 16,
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

  /* Compact horizontal card */
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    overflow: 'hidden',
  },
  thumbWrap: { width: 88, height: 88 },
  thumb: { width: 88, height: 88 },
  thumbPlaceholder: {
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  cardLocation: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', flex: 1 },
  cardTime: { fontSize: 11, color: '#888', flexShrink: 0 },
  linkedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 3,
    marginBottom: 3,
  },
  linkedChipText: { fontSize: 10, fontWeight: '600', color: '#FF9800' },
  cardNote: { fontSize: 13, color: '#666', lineHeight: 18, marginTop: 2 },
  photosCount: { fontSize: 12, color: '#4CAF50', fontWeight: '600', marginTop: 4 },

  footerDecor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  /* Modal form */
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 0.4,
    marginBottom: 6,
    marginTop: 12,
  },
  optionalLabel: { fontSize: 11, fontWeight: '400', color: '#BBB' },
  input: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1A1A1A',
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  activityChips: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  actChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EBEBEB',
  },
  actChipActive: { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' },
  actChipText: { fontSize: 12, fontWeight: '600', color: '#666' },
  actChipTextActive: { color: '#4CAF50' },
  photoUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    marginBottom: 4,
  },
  photoUploadText: { fontSize: 14, fontWeight: '600', color: '#666' },
});
