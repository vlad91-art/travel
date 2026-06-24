import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/useAppStore';
import CartoonIcon from '../components/CartoonIcon';
import { Sparkle, Dot } from '../components/TravelDecorations';
import { MenuSheet } from '../components/BottomSheet';
import BottomSheet, { SheetButton } from '../components/BottomSheet';
import { Document as TravelDocument } from '../data/sampleData';

const DOC_TYPES = ['Passport', 'Insurance', 'Flight Ticket', 'Hotel Confirmation', 'Visa', 'Other'];
const DOC_ICONS: Record<string, { emoji: string; bg: string }> = {
  Passport: { emoji: '📘', bg: '#E3F2FD' },
  Insurance: { emoji: '🛡️', bg: '#E8F5E9' },
  'Flight Ticket': { emoji: '✈️', bg: '#F3E5F5' },
  'Hotel Confirmation': { emoji: '🏨', bg: '#EDE7F6' },
  Visa: { emoji: '📋', bg: '#FFF8E1' },
  Other: { emoji: '📄', bg: '#F5F5F5' },
};

function F({ label, placeholder, value, onChangeText, optional }: {
  label: string; placeholder: string; value: string;
  onChangeText: (t: string) => void; optional?: boolean;
}) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={fStyles.label}>
        {label}{optional ? <Text style={fStyles.optional}> (optional)</Text> : null}
      </Text>
      <TextInput
        style={fStyles.input}
        placeholder={placeholder}
        placeholderTextColor="#C0C0C0"
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const fStyles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '700', color: '#888', marginBottom: 5, letterSpacing: 0.3 },
  optional: { fontWeight: '400', color: '#BBB' },
  input: {
    backgroundColor: '#FAFAFA', borderRadius: 12, borderWidth: 0.5, borderColor: '#E0E0E0',
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#1A1A1A',
  },
});

export default function DocumentsScreen() {
  const navigation = useNavigation();
  const { documents, addDocument, deleteDocument } = useAppStore();
  const [menuVisible, setMenuVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [detailDoc, setDetailDoc] = useState<TravelDocument | null>(null);

  // Form state
  const [docType, setDocType] = useState('Passport');
  const [docTitle, setDocTitle] = useState('');
  const [docDetail, setDocDetail] = useState('');
  const [docExpiry, setDocExpiry] = useState('');

  const handleSave = () => {
    if (!docTitle.trim()) return;
    const iconInfo = DOC_ICONS[docType] ?? DOC_ICONS.Other;
    addDocument({
      name: docTitle.trim(),
      detail: docDetail || docType,
      icon: iconInfo.emoji,
      iconBg: iconInfo.bg,
      savedOffline: false,
    });
    setDocTitle(''); setDocDetail(''); setDocExpiry(''); setDocType('Passport');
    setAddModalVisible(false);
  };

  const MENU_ITEMS = [
    { label: 'Add document', icon: '➕', onPress: () => setAddModalVisible(true) },
    { label: 'Sort by type', icon: '🗂️', onPress: () => {} },
    { label: 'Download all offline', icon: '⬇️', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Documents</Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Text style={{ fontSize: 22 }}>⋯</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {documents.map((doc, index) => (
            <View key={doc.id}>
              <TouchableOpacity style={styles.docRow} activeOpacity={0.7} onPress={() => setDetailDoc(doc)}>
                <CartoonIcon emoji={doc.icon} bg={doc.iconBg} size={52} />
                <View style={styles.docInfo}>
                  <Text style={styles.docName}>{doc.name}</Text>
                  <Text style={styles.docDetail}>{doc.detail}</Text>
                  {doc.savedOffline && (
                    <View style={styles.offlineBadge}>
                      <Text style={styles.offlineBadgeText}>Saved offline</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
              {index < documents.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
          <Text style={styles.addIcon}>＋</Text>
          <Text style={styles.addText}>Add document</Text>
        </TouchableOpacity>

        <View style={styles.footerDecor}>
          <Dot color="#DDD" size={5} style={{ position: 'relative' }} />
          <Dot color="#DDD" size={4} style={{ position: 'relative', marginLeft: 8 }} />
          <Sparkle color="#FF9800" size={10} style={{ position: 'relative', marginLeft: 6 }} />
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Document Detail Modal */}
      <Modal visible={!!detailDoc} animationType="slide" onRequestClose={() => setDetailDoc(null)}>
        {detailDoc ? (
          <SafeAreaView style={styles.detailSafe} edges={['top', 'bottom']}>
            <View style={styles.detailHeader}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setDetailDoc(null)}>
                <Text style={styles.backIcon}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.title}>{detailDoc.name}</Text>
              <View style={{ width: 32 }} />
            </View>
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              {/* Document placeholder */}
              <View style={styles.docPreview}>
                <CartoonIcon emoji={detailDoc.icon} bg={detailDoc.iconBg} size={80} />
                <Text style={styles.docPreviewTitle}>{detailDoc.name}</Text>
                <Text style={styles.docPreviewDetail}>{detailDoc.detail}</Text>
              </View>

              {/* Actions */}
              <View style={styles.detailActions}>
                <TouchableOpacity style={[styles.detailActionBtn, { backgroundColor: '#E8F5E9' }]}>
                  <Text style={{ fontSize: 22 }}>⬇️</Text>
                  <Text style={[styles.detailActionText, { color: '#4CAF50' }]}>Download offline</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.detailActionBtn, { backgroundColor: '#E3F2FD' }]}>
                  <Text style={{ fontSize: 22 }}>📤</Text>
                  <Text style={[styles.detailActionText, { color: '#2196F3' }]}>Share</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.deleteDocBtn}
                onPress={() => { deleteDocument(detailDoc.id); setDetailDoc(null); }}
              >
                <Text style={{ fontSize: 18 }}>🗑️</Text>
                <Text style={styles.deleteDocText}>Delete document</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        ) : null}
      </Modal>

      {/* ⋯ Menu */}
      <MenuSheet visible={menuVisible} onClose={() => setMenuVisible(false)} items={MENU_ITEMS} />

      {/* Add Document Modal */}
      <BottomSheet visible={addModalVisible} onClose={() => setAddModalVisible(false)} title="Add Document">
        <Text style={fStyles.label}>Document type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, flexDirection: 'row', marginBottom: 12 }}>
          {DOC_TYPES.map((t) => {
            const info = DOC_ICONS[t] ?? DOC_ICONS.Other;
            return (
              <TouchableOpacity
                key={t}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: docType === t ? '#4CAF50' : '#EBEBEB', backgroundColor: docType === t ? '#E8F5E9' : '#F5F5F5' }}
                onPress={() => setDocType(t)}
              >
                <Text style={{ fontSize: 16 }}>{info.emoji}</Text>
                <Text style={{ fontSize: 12, fontWeight: '600', color: docType === t ? '#4CAF50' : '#666' }}>{t}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <F label="Title" placeholder="e.g. Vlad Popescu — Passport" value={docTitle} onChangeText={setDocTitle} />
        <F label="Details / notes" placeholder="e.g. Expires 12 Jul 2032" value={docDetail} onChangeText={setDocDetail} optional />
        <F label="Expiry date" placeholder="e.g. 12 Jul 2032" value={docExpiry} onChangeText={setDocExpiry} optional />

        <View style={styles.uploadBtn}>
          <Text style={{ fontSize: 22 }}>📎</Text>
          <Text style={styles.uploadBtnText}>Upload photo / PDF</Text>
        </View>

        <SheetButton label="Save Document" onPress={handleSave} disabled={!docTitle.trim()} />
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  detailSafe: { flex: 1, backgroundColor: '#fff' },
  scroll: { flex: 1, padding: 16 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  detailHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 28, color: '#1A1A1A', fontWeight: '300' },
  title: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },

  card: {
    backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 4,
    borderWidth: 1, borderColor: '#F0F0F0', marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  docInfo: { flex: 1 },
  docName: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 3 },
  docDetail: { fontSize: 13, color: '#666', marginBottom: 6 },
  offlineBadge: { alignSelf: 'flex-start', backgroundColor: '#E8F5E9', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  offlineBadgeText: { fontSize: 11, color: '#4CAF50', fontWeight: '600' },
  chevron: { fontSize: 22, color: '#CCC', fontWeight: '300' },
  divider: { height: 1, backgroundColor: '#F5F5F5', marginLeft: 66 },

  addButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, backgroundColor: '#fff', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#E0E0E0', borderStyle: 'dashed',
  },
  addIcon: { fontSize: 20, color: '#4CAF50', fontWeight: '700' },
  addText: { fontSize: 15, fontWeight: '600', color: '#4CAF50' },

  footerDecor: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16 },

  /* Detail screen */
  docPreview: {
    alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24,
    backgroundColor: '#F5F5F5', margin: 16, borderRadius: 20,
  },
  docPreviewTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', marginTop: 16 },
  docPreviewDetail: { fontSize: 14, color: '#666', marginTop: 6, textAlign: 'center' },
  detailActions: { flexDirection: 'row', gap: 12, marginHorizontal: 16, marginBottom: 16 },
  detailActionBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 16, borderRadius: 16 },
  detailActionText: { fontSize: 13, fontWeight: '700' },
  deleteDocBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, marginHorizontal: 16, marginBottom: 24,
    borderRadius: 14, borderWidth: 1.5, borderColor: '#FFCDD2', backgroundColor: '#FFF5F5',
  },
  deleteDocText: { fontSize: 14, fontWeight: '600', color: '#F44336' },

  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 12, marginBottom: 4,
    borderWidth: 1.5, borderColor: '#E0E0E0', borderStyle: 'dashed',
  },
  uploadBtnText: { fontSize: 14, fontWeight: '600', color: '#888' },
});
