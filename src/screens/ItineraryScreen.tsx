import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ITINERARY_DAYS, ITINERARY_ACTIVITIES } from '../data/sampleData';
import CartoonIcon from '../components/CartoonIcon';
import StatusBadge from '../components/StatusBadge';
import { Sparkle, Cloud, Dot, DottedLine } from '../components/TravelDecorations';
import { STATUS_BG, CATEGORY_BG } from '../data/colors';

const ACTIVITY_CATEGORIES: Record<string, string> = {
  'Borobudur Temple': 'Activities',
  'Lunch at Jejamuran': 'Food',
  'Transfer to Airport': 'Transport',
  'Flight to Bali': 'Flights',
  'Check-in Villa Padi Ubud': 'Accommodation',
};

const NAV_TARGETS: Record<string, string> = {
  'Flight to Bali': 'Transport',
  'Check-in Villa Padi Ubud': 'Accommodation',
};

const CATEGORY_OPTIONS = [
  { label: 'Activities', emoji: '🎯' },
  { label: 'Food', emoji: '🍜' },
  { label: 'Transport', emoji: '🚗' },
  { label: 'Flights', emoji: '✈️' },
  { label: 'Accommodation', emoji: '🏨' },
];

function AddActivityModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Activities');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const handleAdd = () => {
    setTitle('');
    setCategory('Activities');
    setTime('');
    setLocation('');
    setNotes('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kvWrapper}
        >
          <Pressable style={styles.bottomSheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Add Activity</Text>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.fieldLabel}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Sunrise at Mount Batur"
                placeholderTextColor="#C0C0C0"
                value={title}
                onChangeText={setTitle}
              />
              <Text style={styles.fieldLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
                {CATEGORY_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.label}
                    style={[styles.catChip, category === opt.label && styles.catChipActive]}
                    onPress={() => setCategory(opt.label)}
                  >
                    <Text style={{ fontSize: 16 }}>{opt.emoji}</Text>
                    <Text style={[styles.catChipText, category === opt.label && styles.catChipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={styles.fieldLabel}>Time</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 08:00"
                placeholderTextColor="#C0C0C0"
                value={time}
                onChangeText={setTime}
              />
              <Text style={styles.fieldLabel}>Location</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Ubud, Bali"
                placeholderTextColor="#C0C0C0"
                value={location}
                onChangeText={setLocation}
              />
              <Text style={styles.fieldLabel}>
                Notes <Text style={styles.optional}>(optional)</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add any extra details..."
                placeholderTextColor="#C0C0C0"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
              <TouchableOpacity
                style={[styles.addActivityBtn, !title.trim() && styles.addActivityBtnDisabled]}
                onPress={handleAdd}
                disabled={!title.trim()}
              >
                <Text style={styles.addActivityBtnText}>Add Activity</Text>
              </TouchableOpacity>
              <View style={{ height: 16 }} />
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

export default function ItineraryScreen() {
  const [selectedDay, setSelectedDay] = useState(8);
  const [showAddModal, setShowAddModal] = useState(false);
  const navigation = useNavigation<any>();

  const handleActivityPress = (title: string) => {
    const target = NAV_TARGETS[title];
    if (target) {
      navigation.navigate(target);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Itinerary</Text>
        <TouchableOpacity style={styles.calIcon}>
          <Text style={{ fontSize: 22 }}>📅</Text>
        </TouchableOpacity>
      </View>

      {/* Day selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dayScroll}
        contentContainerStyle={styles.dayScrollContent}
      >
        {ITINERARY_DAYS.map((day) => (
          <TouchableOpacity
            key={day}
            style={[styles.dayChip, selectedDay === day && styles.dayChipActive]}
            onPress={() => setSelectedDay(day)}
          >
            <Text style={[styles.dayChipText, selectedDay === day && styles.dayChipTextActive]}>
              Day {day}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Location dropdown */}
      <TouchableOpacity style={styles.locationRow}>
        <Text style={styles.locationText}>Yogyakarta</Text>
        <Text style={{ fontSize: 18, marginLeft: 4 }}>▾</Text>
      </TouchableOpacity>

      {/* Activities */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── DAY X ACTIVITIES ── */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWrap}>
              <Cloud size={16} color="#0D47A1" style={{ position: 'relative', marginRight: 6 }} />
              <Text style={[styles.sectionTitle, { color: '#0D47A1' }]}>DAY {selectedDay} · YOGYAKARTA</Text>
            </View>
            <Sparkle color="#0D47A1" size={12} style={{ position: 'relative' }} />
          </View>
          <View style={styles.sectionCard}>
            {ITINERARY_ACTIVITIES.map((activity, index) => {
              const category = ACTIVITY_CATEGORIES[activity.title] ?? 'Activities';
              const catBg = CATEGORY_BG[category] ?? '#fff';
              const statusBg = STATUS_BG[activity.status] ?? '#fff';
              const combinedBg = activity.status === 'DONE' ? statusBg : catBg;

              return (
                <View key={activity.id}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleActivityPress(activity.title)}
                  >
                    <View style={[styles.activityRow, { backgroundColor: combinedBg }]}>
                      <View style={styles.timeCol}>
                        <Text style={styles.time}>{activity.time}</Text>
                        {index < ITINERARY_ACTIVITIES.length - 1 && (
                          <View style={styles.connector} />
                        )}
                      </View>
                      <CartoonIcon emoji={activity.icon} bg={activity.iconBg} size={48} />
                      <View style={styles.content}>
                        <Text style={styles.activityTitle}>{activity.title}</Text>
                        {activity.subtitle ? (
                          <Text style={styles.subtitle}>{activity.subtitle}</Text>
                        ) : null}
                        <View style={styles.categoryTag}>
                          <Dot color="#999" size={4} style={{ position: 'relative' }} />
                          <Text style={styles.categoryText}>{category}</Text>
                        </View>
                      </View>
                      {activity.status === 'DONE' ? (
                        <View style={styles.checkCircle}>
                          <Text style={styles.checkMark}>✓</Text>
                        </View>
                      ) : (
                        <StatusBadge status={activity.status} small />
                      )}
                    </View>
                  </TouchableOpacity>
                  {index < ITINERARY_ACTIVITIES.length - 1 && (
                    <View style={styles.divider}>
                      <DottedLine color="#E0E0E0" style={{ marginLeft: 24 }} />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Travel accent decorations */}
        <View style={styles.decorRow}>
          <Cloud size={18} style={{ position: 'relative' }} />
          <Sparkle color="#FF9800" size={10} style={{ position: 'relative', marginLeft: 8 }} />
          <Dot color="#DDD" size={5} style={{ position: 'relative', marginLeft: 6 }} />
        </View>

        {/* Add activity */}
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addIcon}>＋</Text>
          <Text style={styles.addText}>Add activity</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>

      <AddActivityModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
    </SafeAreaView>
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
  title: { fontSize: 24, fontWeight: '800', color: '#1A1A1A' },
  calIcon: { padding: 4 },

  dayScroll: { backgroundColor: '#fff', maxHeight: 56 },
  dayScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
  },
  dayChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  dayChipActive: { backgroundColor: '#4CAF50' },
  dayChipText: { fontSize: 14, fontWeight: '600', color: '#666' },
  dayChipTextActive: { color: '#fff' },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  locationText: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },

  scroll: { flex: 1, padding: 16 },

  /* ── SECTION BLOCK ── */
  sectionBlock: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#90CAF9',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: '#90CAF9',
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

  /* Activity rows inside the section card */
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
    marginVertical: 2,
  },
  timeCol: { width: 48, alignItems: 'center', paddingTop: 4 },
  time: { fontSize: 13, fontWeight: '700', color: '#444' },
  connector: {
    width: 2,
    flex: 1,
    minHeight: 28,
    backgroundColor: '#E0E0E0',
    marginTop: 6,
  },
  content: { flex: 1, paddingTop: 4 },
  activityTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  subtitle: { fontSize: 12, color: '#888', marginTop: 2 },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  categoryText: { fontSize: 10, color: '#999', fontWeight: '600' },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  checkMark: { fontSize: 14, color: '#fff', fontWeight: '800' },
  divider: { paddingVertical: 4 },

  decorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  addIcon: { fontSize: 20, color: '#4CAF50', fontWeight: '700' },
  addText: { fontSize: 15, fontWeight: '600', color: '#4CAF50' },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  kvWrapper: { justifyContent: 'flex-end' },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '90%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 12,
  },
  optional: { fontSize: 11, fontWeight: '400', color: '#BBB' },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#EBEBEB',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  catRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EBEBEB',
  },
  catChipActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  catChipText: { fontSize: 13, fontWeight: '600', color: '#666' },
  catChipTextActive: { color: '#4CAF50' },
  addActivityBtn: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  addActivityBtnDisabled: {
    backgroundColor: '#C8E6C9',
    shadowOpacity: 0,
    elevation: 0,
  },
  addActivityBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
