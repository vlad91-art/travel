import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/useAppStore';
import { Sparkle, Cloud, Dot, TravelStamp } from '../components/TravelDecorations';
import { MenuSheet } from '../components/BottomSheet';
import BottomSheet, { SheetButton } from '../components/BottomSheet';

const CATEGORY_ICONS: Record<string, string> = {
  Essentials: '✅',
  Clothes: '👕',
  Electronics: '💻',
  Toiletries: '🧴',
  Medication: '💊',
  Other: '🎒',
};

const ADD_CATEGORIES = ['Essentials', 'Clothes', 'Electronics', 'Toiletries', 'Medication', 'Other'];

export default function PackingScreen() {
  const navigation = useNavigation();
  const { packingCategories, togglePackingItem, addPackingItem } = useAppStore();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [menuVisible, setMenuVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Essentials');

  const totalItems = packingCategories.reduce((sum, cat) => sum + cat.items.length, 0);
  const packedItems = packingCategories.reduce(
    (sum, cat) => sum + cat.items.filter((i) => i.packed).length,
    0
  );
  const progress = totalItems > 0 ? packedItems / totalItems : 0;

  const isExpanded = (name: string) => expanded[name] !== false;

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    addPackingItem(selectedCategory, newItemName.trim());
    setNewItemName('');
    setAddModalVisible(false);
  };

  const MENU_ITEMS = [
    { label: 'Edit list name', icon: '✏️', onPress: () => {} },
    { label: 'Share list', icon: '📤', onPress: () => {} },
    { label: 'Clear completed', icon: '✅', onPress: () => {} },
    { label: 'Delete list', icon: '🗑️', onPress: () => {}, danger: true },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Packing List</Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Text style={{ fontSize: 22 }}>⋯</Text>
        </TouchableOpacity>
      </View>

      {/* Header card with progress */}
      <View style={styles.progressCard}>
        <View style={styles.progressTopRow}>
          <View style={styles.progressTitleWrap}>
            <Cloud size={16} style={{ position: 'relative', marginRight: 6 }} />
            <Text style={styles.progressTitle}>Packing List</Text>
          </View>
          <TravelStamp
            label={`${packedItems}/${totalItems} packed`}
            color="#4CAF50"
            style={{ position: 'relative', transform: [] }}
          />
        </View>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressSub}>{packedItems} of {totalItems} items packed</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {packingCategories.map((category) => {
          const catPacked = category.items.filter((i) => i.packed).length;
          const catTotal = category.items.length;
          const expand = isExpanded(category.name);
          const catIcon = CATEGORY_ICONS[category.name] ?? '📦';

          return (
            <View key={category.name} style={styles.categorySection}>
              <TouchableOpacity
                style={styles.categoryHeader}
                onPress={() =>
                  setExpanded((prev) => ({ ...prev, [category.name]: !expand }))
                }
                activeOpacity={0.7}
              >
                <View style={styles.catTitleWrap}>
                  <Text style={styles.catIcon}>{catIcon}</Text>
                  <Text style={styles.categoryTitle}>{category.name}</Text>
                  <View style={styles.catCountBadge}>
                    <Text style={styles.catCountText}>{catPacked}/{catTotal}</Text>
                  </View>
                </View>
                <Text style={[styles.chevron, expand && styles.chevronOpen]}>▾</Text>
              </TouchableOpacity>

              {expand && (
                <View style={styles.card}>
                  {category.items.map((item, index) => (
                    <View key={item.id}>
                      <TouchableOpacity
                        style={styles.itemRow}
                        onPress={() => togglePackingItem(category.name, item.id)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.checkbox, item.packed && styles.checkboxChecked]}>
                          {item.packed && <Text style={styles.checkMark}>✓</Text>}
                        </View>
                        <Text style={[styles.itemName, item.packed && styles.itemNamePacked]}>
                          {item.name}
                        </Text>
                        <Text style={styles.itemChevron}>›</Text>
                      </TouchableOpacity>
                      {index < category.items.length - 1 && <View style={styles.divider} />}
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.footerDecor}>
          <Dot color="#DDD" size={5} style={{ position: 'relative' }} />
          <Dot color="#DDD" size={4} style={{ position: 'relative', marginLeft: 8 }} />
          <Sparkle color="#FF9800" size={10} style={{ position: 'relative', marginLeft: 6 }} />
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setAddModalVisible(true)}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      {/* ⋯ Menu */}
      <MenuSheet visible={menuVisible} onClose={() => setMenuVisible(false)} items={MENU_ITEMS} />

      {/* Add Item Modal */}
      <BottomSheet
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        title="Add Item"
      >
        <Text style={styles.fieldLabel}>Item name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Sunscreen"
          placeholderTextColor="#C0C0C0"
          value={newItemName}
          onChangeText={setNewItemName}
        />

        <Text style={styles.fieldLabel}>Category</Text>
        <View style={styles.catGrid}>
          {ADD_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catOption, selectedCategory === cat && styles.catOptionActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={{ fontSize: 18 }}>{CATEGORY_ICONS[cat]}</Text>
              <Text style={[styles.catOptionText, selectedCategory === cat && styles.catOptionTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <SheetButton label="Add Item" onPress={handleAddItem} disabled={!newItemName.trim()} />
      </BottomSheet>
    </SafeAreaView>
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

  progressCard: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  progressTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressTitleWrap: { flexDirection: 'row', alignItems: 'center' },
  progressTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  progressBg: { height: 8, backgroundColor: '#E0E0E0', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 4 },
  progressSub: { fontSize: 12, color: '#888' },

  scroll: { flex: 1, padding: 16 },

  categorySection: { marginBottom: 14 },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 2,
  },
  catTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catIcon: { fontSize: 18 },
  categoryTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  catCountBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  catCountText: { fontSize: 12, fontWeight: '600', color: '#4CAF50' },
  chevron: { fontSize: 16, color: '#888' },
  chevronOpen: { transform: [{ rotate: '180deg' }] },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  checkbox: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: '#E0E0E0',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  checkMark: { fontSize: 13, color: '#fff', fontWeight: '800' },
  itemName: { flex: 1, fontSize: 15, color: '#1A1A1A', fontWeight: '500' },
  itemNamePacked: { color: '#888', textDecorationLine: 'line-through' },
  itemChevron: { fontSize: 18, color: '#DDD', fontWeight: '300' },
  divider: { height: 1, backgroundColor: '#F5F5F5', marginLeft: 36 },

  footerDecor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },

  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#4CAF50',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#4CAF50', shadowOpacity: 0.4, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  fabText: { fontSize: 28, color: '#fff', fontWeight: '400', lineHeight: 32 },

  fieldLabel: {
    fontSize: 12, fontWeight: '700', color: '#888',
    letterSpacing: 0.4, marginBottom: 6, marginTop: 12,
  },
  input: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12, borderWidth: 0.5, borderColor: '#E0E0E0',
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#1A1A1A',
  },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  catOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    backgroundColor: '#F5F5F5',
  },
  catOptionActive: { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' },
  catOptionText: { fontSize: 13, fontWeight: '600', color: '#666' },
  catOptionTextActive: { color: '#4CAF50' },
});
