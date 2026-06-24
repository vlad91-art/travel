import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/useAppStore';
import { Sparkle, Dot } from '../components/TravelDecorations';
import {
  ArrowLeftIcon, CloseIcon, PlusIcon, CheckIcon,
  CameraScanIcon, PdfIcon, ImportEmailIcon, AddManualIcon,
  WarningIcon, ExpiredIcon, DocumentIcon,
  getDocumentTypeIcon, LockIcon,
} from '../components/TravelBuddyIcons';

const { width } = Dimensions.get('window');

// ─── Helper: Field component ────────────────────────────────────────────────
function F({ label, placeholder, value, onChangeText, optional }: {
  label: string; placeholder: string; value: string;
  onChangeText: (t: string) => void; optional?: boolean;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
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
  label: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 6 },
  optional: { fontWeight: '400', color: '#BBB' },
  input: {
    backgroundColor: '#F5F5F5', borderRadius: 12, borderWidth: 1, borderColor: '#EBEBEB',
    paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: '#1A1A1A',
  },
});

// ─── Types ──────────────────────────────────────────────────────────────────
interface DocItem {
  id: string;
  type: string;
  holderName: string;
  documentNumber: string;
  nationality?: string;
  expiryDate: string;
  icon: string;
  iconBg: string;
  savedOffline: boolean;
}

// ─── Sample data ────────────────────────────────────────────────────────────
const SAMPLE_DOCUMENTS: DocItem[] = [
  {
    id: '1', type: 'Passport', holderName: 'Vlad Popescu',
    documentNumber: 'RO1234567', nationality: 'Romanian',
    expiryDate: '12 Jul 2028', icon: 'passport', iconBg: '#E3F2FD',
    savedOffline: true,
  },
  {
    id: '2', type: 'Insurance', holderName: 'Vlad Popescu',
    documentNumber: 'SW-12345678',
    expiryDate: '28 Jun 2026', icon: 'insurance', iconBg: '#E8F5E9',
    savedOffline: true,
  },
  {
    id: '3', type: 'Flight Ticket', holderName: 'Vlad Popescu',
    documentNumber: 'TK57-IST-CGK',
    expiryDate: '09 May 2025', icon: 'flight', iconBg: '#F3E5F5',
    savedOffline: true,
  },
  {
    id: '4', type: 'Hotel Confirmation', holderName: 'Vlad Popescu',
    documentNumber: 'VPU123456',
    expiryDate: '20 May 2025', icon: 'hotel', iconBg: '#EDE7F6',
    savedOffline: true,
  },
  {
    id: '5', type: 'Visa', holderName: 'Vlad Popescu',
    documentNumber: 'ID-E-VISA-789',
    expiryDate: '12 Jul 2025', icon: 'visa', iconBg: '#FFF8E1',
    savedOffline: false,
  },
];

// ─── Helper: compute expiry warning ─────────────────────────────────────────
function getExpiryWarning(expiryDate: string): { state: 'safe' | 'warning' | 'expired'; daysLeft: number } {
  const now = new Date();
  const exp = new Date(expiryDate);
  const diffTime = exp.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { state: 'expired', daysLeft: diffDays };
  if (diffDays <= 90) return { state: 'warning', daysLeft: diffDays };
  return { state: 'safe', daysLeft: diffDays };
}

// ─── Helper: Summary Card ───────────────────────────────────────────────────
function SummaryCard({ label, value, icon, color, bgColor }: {
  label: string; value: string | number; icon: React.ReactNode; color: string; bgColor: string;
}) {
  return (
    <View style={[summaryStyles.card, { backgroundColor: bgColor }]}>
      <View style={summaryStyles.iconWrap}>{icon}</View>
      <Text style={[summaryStyles.value, { color }]}>{value}</Text>
      <Text style={summaryStyles.label}>{label}</Text>
    </View>
  );
}

const summaryStyles = StyleSheet.create({
  card: {
    flex: 1, borderRadius: 16, padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  iconWrap: { marginBottom: 8 },
  value: { fontSize: 24, fontWeight: '900', marginBottom: 2 },
  label: { fontSize: 12, color: '#888', fontWeight: '600' },
});

// ─── Helper: Document Card ──────────────────────────────────────────────────
function DocumentCard({ doc, onPress }: { doc: DocItem; onPress: () => void }) {
  const warning = getExpiryWarning(doc.expiryDate);
  const isWarning = warning.state === 'warning';
  const isExpired = warning.state === 'expired';

  return (
    <TouchableOpacity style={docCardStyles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={docCardStyles.topRow}>
        {getDocumentTypeIcon(doc.type)}
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={docCardStyles.type}>{doc.type}</Text>
          <Text style={docCardStyles.holder}>{doc.holderName}</Text>
        </View>
        <ChevronRightIcon size={20} />
      </View>

      <View style={docCardStyles.bottomRow}>
        <View style={docCardStyles.expiryWrap}>
          {isExpired ? (
            <ExpiredIcon size={16} color="#F44336" />
          ) : isWarning ? (
            <WarningIcon size={16} color="#FF9800" />
          ) : (
            <CheckIcon size={16} color="#4CAF50" />
          )}
          <Text style={[docCardStyles.expiryText, isExpired && { color: '#F44336' }, isWarning && { color: '#FF9800' }]}>
            Expires {doc.expiryDate}
          </Text>
        </View>
        {doc.savedOffline && (
          <View style={docCardStyles.offlineBadge}>
            <Text style={docCardStyles.offlineText}>Offline</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function ChevronRightIcon({ size = 24 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.7, color: '#CCC', fontWeight: '300' }}>›</Text>
    </View>
  );
}

const docCardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  type: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  holder: { fontSize: 12, color: '#888', marginTop: 1 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  expiryWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  expiryText: { fontSize: 12, color: '#4CAF50', fontWeight: '600' },
  offlineBadge: { backgroundColor: '#E8F5E9', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  offlineText: { fontSize: 10, fontWeight: '700', color: '#4CAF50' },
});

// ─── Helper: Add Hub Option ─────────────────────────────────────────────────
function HubOption({ icon, title, subtitle, onPress, color }: {
  icon: React.ReactNode; title: string; subtitle: string; onPress: () => void; color: string;
}) {
  return (
    <TouchableOpacity style={hubOptionStyles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[hubOptionStyles.iconBg, { backgroundColor: `${color}15` }]}>
        {icon}
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={hubOptionStyles.title}>{title}</Text>
        <Text style={hubOptionStyles.subtitle}>{subtitle}</Text>
      </View>
      <ChevronRightIcon size={20} />
    </TouchableOpacity>
  );
}

const hubOptionStyles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  iconBg: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  subtitle: { fontSize: 12, color: '#888', marginTop: 2 },
});

// ─── Main Screen ────────────────────────────────────────────────────────────
export default function DocumentsScreen() {
  const navigation = useNavigation();
  const { documents, addDocument, deleteDocument } = useAppStore();
  const [screen, setScreen] = useState<'dashboard' | 'addHub' | 'scan' | 'scanReview' | 'uploadPdf' | 'emailIntro' | 'emailResults' | 'manual' | 'detail' | 'success'>('dashboard');
  const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null);

  // Scan form state
  const [scannedName, setScannedName] = useState('Vlad Popescu');
  const [scannedNumber, setScannedNumber] = useState('RO1234567');
  const [scannedNationality, setScannedNationality] = useState('Romanian');
  const [scannedExpiry, setScannedExpiry] = useState('12 Jul 2028');

  // Manual form state
  const [manualType, setManualType] = useState('Passport');
  const [manualName, setManualName] = useState('');
  const [manualNumber, setManualNumber] = useState('');
  const [manualExpiry, setManualExpiry] = useState('');

  // Gmail results state
  const [emailSelections, setEmailSelections] = useState<Record<string, boolean>>({
    'e1': true, 'e2': true, 'e3': false,
  });

  const allDocs = documents.length > 0 ? documents.map((d) => ({
    id: d.id,
    type: d.detail || 'Other',
    holderName: d.name,
    documentNumber: d.detail || '',
    expiryDate: '12 Jul 2028',
    icon: d.icon,
    iconBg: d.iconBg,
    savedOffline: d.savedOffline,
  } as DocItem)) : SAMPLE_DOCUMENTS;

  const expiringSoon = useMemo(() => {
    return allDocs.filter((d) => {
      const w = getExpiryWarning(d.expiryDate);
      return w.state === 'warning' || w.state === 'expired';
    });
  }, [allDocs]);

  const handleSaveScan = () => {
    addDocument({
      name: scannedName,
      detail: 'Passport',
      icon: 'passport',
      iconBg: '#E3F2FD',
      savedOffline: true,
    });
    setScreen('success');
  };

  const handleSaveManual = () => {
    if (!manualName.trim()) return;
    addDocument({
      name: manualName.trim(),
      detail: manualType,
      icon: 'document',
      iconBg: '#F5F5F5',
      savedOffline: false,
    });
    setManualName(''); setManualNumber(''); setManualExpiry('');
    setScreen('success');
  };

  const handleImportEmail = () => {
    const selected = Object.entries(emailSelections).filter(([, v]) => v);
    selected.forEach(() => {
      addDocument({
        name: 'Imported from Gmail',
        detail: 'Flight Ticket',
        icon: 'flight',
        iconBg: '#F3E5F5',
        savedOffline: true,
      });
    });
    setScreen('success');
  };

  const goToDashboard = () => {
    setScreen('dashboard');
    setSelectedDoc(null);
  };

  // ─── 1. DASHBOARD ──
  if (screen === 'dashboard') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeftIcon size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Documents</Text>
          <TouchableOpacity onPress={() => setScreen('addHub')}>
            <PlusIcon size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Summary cards */}
          <View style={dashStyles.summaryRow}>
            <SummaryCard
              label="Documents"
              value={allDocs.length}
              icon={<DocumentIcon size={24} color="#2196F3" />}
              color="#2196F3"
              bgColor="#E3F2FD"
            />
            <SummaryCard
              label="Expiring soon"
              value={expiringSoon.length}
              icon={<WarningIcon size={24} color="#FF9800" />}
              color="#FF9800"
              bgColor="#FFF8E1"
            />
          </View>

          {/* Document list */}
          <View style={dashStyles.sectionHeader}>
            <Text style={dashStyles.sectionTitle}>YOUR DOCUMENTS</Text>
          </View>

          <View style={dashStyles.docsList}>
            {allDocs.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onPress={() => { setSelectedDoc(doc); setScreen('detail'); }}
              />
            ))}
          </View>

          {/* Add button */}
          <TouchableOpacity style={dashStyles.addBtn} onPress={() => setScreen('addHub')}>
            <PlusIcon size={20} color="#4CAF50" />
            <Text style={dashStyles.addBtnText}>Add document</Text>
          </TouchableOpacity>

          {/* Security note */}
          <View style={dashStyles.securityNote}>
            <LockIcon size={18} color="#4CAF50" />
            <Text style={dashStyles.securityText}>Keep your important documents safe and accessible anywhere.</Text>
          </View>

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

  // ─── 2. ADD HUB ──
  if (screen === 'addHub') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={goToDashboard}>
            <CloseIcon size={22} />
          </TouchableOpacity>
          <Text style={styles.title}>Add Document</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={hubStyles.subtitle}>How would you like to add it?</Text>

          <HubOption
            icon={<CameraScanIcon size={24} color="#4CAF50" />}
            title="Scan document"
            subtitle="Use your camera to scan"
            onPress={() => setScreen('scan')}
            color="#4CAF50"
          />
          <HubOption
            icon={<PdfIcon size={24} color="#F44336" />}
            title="Upload PDF"
            subtitle="Upload from your device"
            onPress={() => setScreen('uploadPdf')}
            color="#F44336"
          />
          <HubOption
            icon={<ImportEmailIcon size={24} color="#EA4335" />}
            title="Import from email"
            subtitle="Find in your inbox"
            onPress={() => setScreen('emailIntro')}
            color="#EA4335"
          />
          <HubOption
            icon={<AddManualIcon size={24} color="#FF9800" />}
            title="Add manually"
            subtitle="Enter details yourself"
            onPress={() => setScreen('manual')}
            color="#FF9800"
          />

          <View style={hubStyles.securityNote}>
            <LockIcon size={18} color="#4CAF50" />
            <Text style={hubStyles.securityText}>We keep your documents private and secure.</Text>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── 3. SCAN DOCUMENT (Camera) ──
  if (screen === 'scan') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={scanStyles.cameraContainer}>
          {/* Camera frame overlay */}
          <View style={scanStyles.frameOverlay}>
            <View style={scanStyles.frameTop} />
            <View style={scanStyles.frameMiddle}>
              <View style={scanStyles.frameSide} />
              <View style={scanStyles.frameCenter}>
                {/* Corner brackets */}
                <View style={[scanStyles.corner, scanStyles.cornerTL]} />
                <View style={[scanStyles.corner, scanStyles.cornerTR]} />
                <View style={[scanStyles.corner, scanStyles.cornerBL]} />
                <View style={[scanStyles.corner, scanStyles.cornerBR]} />
              </View>
              <View style={scanStyles.frameSide} />
            </View>
            <View style={scanStyles.frameBottom}>
              <Text style={scanStyles.frameText}>Position the document{'\n'}inside the frame</Text>
              <TouchableOpacity style={scanStyles.captureBtn} onPress={() => setScreen('scanReview')}>
                <View style={scanStyles.captureBtnInner} />
              </TouchableOpacity>
              <View style={scanStyles.autoCaptureRow}>
                <CheckIcon size={14} color="#4CAF50" />
                <Text style={scanStyles.autoCaptureText}>Auto capture</Text>
              </View>
            </View>
          </View>

          {/* Header overlay */}
          <View style={scanStyles.headerOverlay}>
            <TouchableOpacity style={scanStyles.closeBtn} onPress={() => setScreen('addHub')}>
              <CloseIcon size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={scanStyles.headerTitle}>Scan Document</Text>
            <View style={{ width: 32 }} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ─── 4. SCAN REVIEW ──
  if (screen === 'scanReview') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setScreen('scan')}>
            <ArrowLeftIcon size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Document Preview</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Success illustration */}
          <View style={scanReviewStyles.successIllustration}>
            <View style={scanReviewStyles.checkCircle}>
              <CheckIcon size={32} color="#fff" />
            </View>
            <Text style={scanReviewStyles.successTitle}>We've extracted the details!</Text>
            <Text style={scanReviewStyles.successSub}>Please review and confirm.</Text>
          </View>

          {/* Document preview placeholder */}
          <View style={scanReviewStyles.previewBox}>
            <View style={scanReviewStyles.previewPlaceholder}>
              <PassportIcon size={48} color="#3F51B5" />
              <Text style={scanReviewStyles.previewLabel}>Passport scan preview</Text>
            </View>
          </View>

          {/* Extracted data */}
          <View style={scanReviewStyles.detailsCard}>
            <Text style={scanReviewStyles.detailsTitle}>Extracted information</Text>
            <EditRow label="Document type" value="Passport" />
            <EditRow label="Holder name" value={scannedName} onChange={setScannedName} editable />
            <EditRow label="Document number" value={scannedNumber} onChange={setScannedNumber} editable />
            <EditRow label="Nationality" value={scannedNationality} onChange={setScannedNationality} editable />
            <EditRow label="Expiry date" value={scannedExpiry} onChange={setScannedExpiry} editable last />
          </View>

          <TouchableOpacity style={scanReviewStyles.saveBtn} onPress={handleSaveScan}>
            <Text style={scanReviewStyles.saveBtnText}>Save Document</Text>
          </TouchableOpacity>

          <TouchableOpacity style={scanReviewStyles.editBtn} onPress={() => {}}>
            <Text style={scanReviewStyles.editBtnText}>Edit details</Text>
          </TouchableOpacity>

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── 5. UPLOAD PDF ──
  if (screen === 'uploadPdf') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setScreen('addHub')}>
            <ArrowLeftIcon size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Upload PDF</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView contentContainerStyle={pdfStyles.content} showsVerticalScrollIndicator={false}>
          <View style={pdfStyles.uploadBox}>
            <PdfIcon size={56} color="#F44336" />
            <Text style={pdfStyles.uploadText}>Tap to upload your PDF</Text>
            <Text style={pdfStyles.uploadSub}>Browse files from your device</Text>
            <TouchableOpacity style={pdfStyles.chooseBtn} onPress={() => setScreen('success')}>
              <Text style={pdfStyles.chooseBtnText}>Choose file</Text>
            </TouchableOpacity>
          </View>

          <Text style={pdfStyles.hint}>Works with passports, visas, insurance and more</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── 6. EMAIL INTRO ──
  if (screen === 'emailIntro') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setScreen('addHub')}>
            <ArrowLeftIcon size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Import from Email</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView contentContainerStyle={emailIntroStyles.content} showsVerticalScrollIndicator={false}>
          {/* Illustration */}
          <View style={emailIntroStyles.illustration}>
            <View style={emailIntroStyles.illBg}>
              <View style={[emailIntroStyles.illHill, { left: -10, backgroundColor: '#C8E6C9' }]} />
              <View style={[emailIntroStyles.illHill, { right: -10, backgroundColor: '#A5D6A7', width: 100 }]} />
            </View>
            <ImportEmailIcon size={72} color="#EA4335" />
            <Sparkle color="#FFD700" size={14} style={{ position: 'absolute', left: 30, top: 20 }} />
            <Sparkle color="#4CAF50" size={10} style={{ position: 'absolute', right: 40, top: 16 }} />
          </View>

          <Text style={emailIntroStyles.heading}>Find documents{'\n'}in your inbox</Text>
          <Text style={emailIntroStyles.sub}>We'll look for booking confirmations, tickets and more</Text>

          {/* Benefits */}
          <View style={emailIntroStyles.benefitsCard}>
            <BenefitItem icon={<LockIcon size={22} color="#4CAF50" />} title="Secure & private" desc="We only read booking emails" />
            <BenefitItem icon={<ControlIcon size={22} color="#FF9800" />} title="You're in control" desc="Choose what to import" />
            <BenefitItem icon={<LightningIcon size={22} color="#FFEB3B" />} title="Fast & easy" desc="Save time and stay organized" last />
          </View>

          <TouchableOpacity style={emailIntroStyles.connectBtn} onPress={() => setScreen('emailResults')}>
            <Text style={emailIntroStyles.connectBtnText}>Connect Gmail</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── 7. EMAIL RESULTS ──
  if (screen === 'emailResults') {
    const selectedCount = Object.values(emailSelections).filter(Boolean).length;
    const EMAIL_RESULTS = [
      { id: 'e1', name: 'Flight Confirmation', detail: 'Garuda Indonesia GA408', platform: 'Airbnb', selected: true },
      { id: 'e2', name: 'Hotel Booking', detail: 'Villa Padi Ubud', platform: 'Booking.com', selected: true },
      { id: 'e3', name: 'Travel Insurance', detail: 'SafetyWing Policy', platform: 'Agoda', selected: false },
    ];

    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setScreen('emailIntro')}>
            <ArrowLeftIcon size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Import from Email</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={emailResultsStyles.banner}>
            <Text style={emailResultsStyles.bannerTitle}>Found 3 documents</Text>
            <Text style={emailResultsStyles.bannerSub}>Select what you want to import</Text>
          </View>

          <View style={emailResultsStyles.card}>
            {EMAIL_RESULTS.map((item, index) => (
              <View key={item.id}>
                <TouchableOpacity
                  style={emailResultsStyles.row}
                  onPress={() => setEmailSelections((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                  activeOpacity={0.7}
                >
                  <View style={[emailResultsStyles.checkbox, emailSelections[item.id] && emailResultsStyles.checkboxChecked]}>
                    {emailSelections[item.id] && <CheckIcon size={14} color="#fff" />}
                  </View>
                  <View style={emailResultsStyles.iconBg}>
                    {getDocumentTypeIcon(item.name.includes('Flight') ? 'Flight Ticket' : item.name.includes('Hotel') ? 'Hotel Confirmation' : 'Insurance', 24)}
                  </View>
                  <View style={emailResultsStyles.info}>
                    <Text style={emailResultsStyles.name}>{item.name}</Text>
                    <Text style={emailResultsStyles.detail}>{item.detail}</Text>
                    <Text style={emailResultsStyles.platform}>{item.platform}</Text>
                  </View>
                </TouchableOpacity>
                {index < EMAIL_RESULTS.length - 1 && <View style={emailResultsStyles.divider} />}
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[emailResultsStyles.importBtn, selectedCount === 0 && emailResultsStyles.importBtnDisabled]}
            onPress={handleImportEmail}
            disabled={selectedCount === 0}
          >
            <Text style={emailResultsStyles.importBtnText}>Import {selectedCount} selected</Text>
          </TouchableOpacity>

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── 8. MANUAL ADD ──
  if (screen === 'manual') {
    const canSave = manualName.trim() && manualType;
    const DOC_TYPES = ['Passport', 'Insurance', 'Flight Ticket', 'Hotel Confirmation', 'Visa', 'Other'];

    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setScreen('addHub')}>
            <CloseIcon size={22} />
          </TouchableOpacity>
          <Text style={styles.title}>Add Manually</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={manualScreenStyles.sectionTitle}>Document Details</Text>

          <Text style={fStyles.label}>Document type</Text>
          <View style={manualScreenStyles.typeRow}>
            {DOC_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[manualScreenStyles.typeChip, manualType === t && manualScreenStyles.typeChipActive]}
                onPress={() => setManualType(t)}
              >
                {getDocumentTypeIcon(t, 18)}
                <Text style={[manualScreenStyles.typeText, manualType === t && manualScreenStyles.typeTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <F label="Holder name" placeholder="e.g. Vlad Popescu" value={manualName} onChangeText={setManualName} />
          <F label="Document number" placeholder="e.g. RO1234567" value={manualNumber} onChangeText={setManualNumber} optional />
          <F label="Expiry date" placeholder="e.g. 12 Jul 2028" value={manualExpiry} onChangeText={setManualExpiry} optional />

          <TouchableOpacity
            style={[manualScreenStyles.saveBtn, !canSave && manualScreenStyles.saveBtnDisabled]}
            onPress={handleSaveManual}
            disabled={!canSave}
          >
            <Text style={manualScreenStyles.saveBtnText}>Save Document</Text>
          </TouchableOpacity>

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── 9. DOCUMENT DETAIL ──
  if (screen === 'detail' && selectedDoc) {
    const warning = getExpiryWarning(selectedDoc.expiryDate);
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={goToDashboard}>
            <ArrowLeftIcon size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>{selectedDoc.type}</Text>
          <TouchableOpacity onPress={() => { deleteDocument(selectedDoc.id); goToDashboard(); }}>
            <Text style={{ fontSize: 18, color: '#F44336' }}>Delete</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Preview */}
          <View style={detailStyles.previewBox}>
            <View style={detailStyles.previewPlaceholder}>
              {getDocumentTypeIcon(selectedDoc.type, 64)}
              <Text style={detailStyles.previewLabel}>{selectedDoc.type}</Text>
            </View>
          </View>

          {/* Details */}
          <View style={detailStyles.detailsCard}>
            <DetailRow label="Document type" value={selectedDoc.type} />
            <DetailRow label="Holder name" value={selectedDoc.holderName} />
            <DetailRow label="Document number" value={selectedDoc.documentNumber} />
            {selectedDoc.nationality && <DetailRow label="Nationality" value={selectedDoc.nationality} />}
            <DetailRow
              label="Expiry date"
              value={selectedDoc.expiryDate}
              warning={warning.state !== 'safe'}
              last
            />
          </View>

          {/* Actions */}
          <View style={detailStyles.actionsRow}>
            <TouchableOpacity style={[detailStyles.actionBtn, { backgroundColor: '#E8F5E9' }]}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#4CAF50' }}>Download</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[detailStyles.actionBtn, { backgroundColor: '#E3F2FD' }]}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#2196F3' }}>Share</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── 10. SUCCESS ──
  if (screen === 'success') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={successStyles.content} showsVerticalScrollIndicator={false}>
          <View style={successStyles.illustration}>
            <View style={successStyles.illBg}>
              <View style={[successStyles.illHill, { left: -10, backgroundColor: '#C8E6C9' }]} />
              <View style={[successStyles.illHill, { right: -10, backgroundColor: '#A5D6A7', width: 100 }]} />
            </View>
            <DocumentIcon size={80} color="#4CAF50" />
            <View style={successStyles.checkCircle}>
              <CheckIcon size={20} color="#fff" />
            </View>
            <Sparkle color="#FFD700" size={14} style={{ position: 'absolute', left: 30, top: 20 }} />
            <Sparkle color="#4CAF50" size={10} style={{ position: 'absolute', right: 40, top: 16 }} />
          </View>

          <Text style={successStyles.heading}>All set!</Text>
          <Text style={successStyles.sub}>Your document has been added{'\n'}to your collection.</Text>

          <TouchableOpacity style={successStyles.viewBtn} onPress={goToDashboard}>
            <Text style={successStyles.viewBtnText}>View Documents</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function PassportIcon({ size = 24, color = '#3F51B5' }: { size?: number; color?: string }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.6, color }}>ID</Text>
    </View>
  );
}

function ControlIcon({ size = 24, color = '#FF9800' }: { size?: number; color?: string }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <CheckIcon size={size * 0.7} color={color} />
    </View>
  );
}

function LightningIcon({ size = 24, color = '#FFEB3B' }: { size?: number; color?: string }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.6, color }}>⚡</Text>
    </View>
  );
}

function BenefitItem({ icon, title, desc, last }: { icon: React.ReactNode; title: string; desc: string; last?: boolean }) {
  return (
    <View style={[emailIntroStyles.benefitRow, !last && emailIntroStyles.benefitBorder]}>
      {icon}
      <View style={{ marginLeft: 12 }}>
        <Text style={emailIntroStyles.benefitTitle}>{title}</Text>
        <Text style={emailIntroStyles.benefitDesc}>{desc}</Text>
      </View>
    </View>
  );
}

function EditRow({ label, value, onChange, editable, last }: {
  label: string; value: string; onChange?: (t: string) => void; editable?: boolean; last?: boolean;
}) {
  return (
    <View style={[editRowStyles.row, !last && editRowStyles.rowBorder]}>
      <Text style={editRowStyles.label}>{label}</Text>
      {editable ? (
        <TextInput
          style={editRowStyles.input}
          value={value}
          onChangeText={onChange || (() => {})}
          placeholderTextColor="#C0C0C0"
        />
      ) : (
        <Text style={editRowStyles.value}>{value}</Text>
      )}
    </View>
  );
}

const editRowStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  label: { fontSize: 13, color: '#888', flex: 1 },
  value: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', textAlign: 'right', maxWidth: '55%' },
  input: {
    fontSize: 14, fontWeight: '600', color: '#1A1A1A', textAlign: 'right',
    backgroundColor: '#F5F5F5', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
    maxWidth: '55%',
  },
});

function DetailRow({ label, value, warning, last }: {
  label: string; value: string; warning?: boolean; last?: boolean;
}) {
  return (
    <View style={[detailRowStyles.row, !last && detailRowStyles.rowBorder]}>
      <Text style={detailRowStyles.label}>{label}</Text>
      <Text style={[detailRowStyles.value, warning && { color: '#FF9800' }]}>{value}</Text>
    </View>
  );
}

const detailRowStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  label: { fontSize: 13, color: '#888', flex: 1 },
  value: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', textAlign: 'right', maxWidth: '55%' },
});

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  scroll: { flex: 1, paddingHorizontal: 16 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 28, color: '#1A1A1A', fontWeight: '300' },
  title: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  footerDecor: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16 },
});

// ─── Dashboard Styles ───────────────────────────────────────────────────────
const dashStyles = StyleSheet.create({
  summaryRow: { flexDirection: 'row', gap: 10, marginTop: 16, marginBottom: 8 },
  sectionHeader: { marginTop: 8, marginBottom: 10 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#888', letterSpacing: 0.8 },
  docsList: { marginBottom: 8 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, backgroundColor: '#fff', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#E0E0E0', borderStyle: 'dashed',
    marginBottom: 16,
  },
  addBtnText: { fontSize: 15, fontWeight: '600', color: '#4CAF50' },
  securityNote: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#E8F5E9', borderRadius: 12, padding: 12,
    marginBottom: 8, borderWidth: 1, borderColor: '#A5D6A7',
  },
  securityText: { flex: 1, fontSize: 13, color: '#555', lineHeight: 18 },
});

// ─── Hub Styles ─────────────────────────────────────────────────────────────
const hubStyles = StyleSheet.create({
  subtitle: { fontSize: 14, color: '#888', marginBottom: 16, marginTop: 8 },
  securityNote: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#E8F5E9', borderRadius: 12, padding: 12,
    marginTop: 16, borderWidth: 1, borderColor: '#A5D6A7',
  },
  securityText: { flex: 1, fontSize: 13, color: '#555', lineHeight: 18 },
});

// ─── Scan Styles ────────────────────────────────────────────────────────────
const scanStyles = StyleSheet.create({
  cameraContainer: { flex: 1, backgroundColor: '#1A1A1A' },
  frameOverlay: { flex: 1, position: 'relative' },
  frameTop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  frameMiddle: { flexDirection: 'row', height: width * 0.6 },
  frameSide: { width: (width - width * 0.75) / 2, backgroundColor: 'rgba(0,0,0,0.5)' },
  frameCenter: {
    width: width * 0.75, height: width * 0.6,
    position: 'relative', borderWidth: 2, borderColor: '#4CAF50',
  },
  corner: { position: 'absolute', width: 24, height: 24, borderColor: '#4CAF50' },
  cornerTL: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4 },
  cornerTR: { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4 },
  cornerBL: { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4 },
  cornerBR: { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4 },
  frameBottom: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center', paddingBottom: 40,
  },
  frameText: { color: '#fff', fontSize: 15, fontWeight: '600', textAlign: 'center', marginBottom: 20 },
  captureBtn: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center',
  },
  captureBtnInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff' },
  autoCaptureRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16 },
  autoCaptureText: { color: '#fff', fontSize: 13 },
  headerOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12,
  },
  closeBtn: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
});

// ─── Scan Review Styles ─────────────────────────────────────────────────────
const scanReviewStyles = StyleSheet.create({
  successIllustration: { alignItems: 'center', marginTop: 16, marginBottom: 16 },
  checkCircle: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#4CAF50',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    borderWidth: 3, borderColor: '#fff',
    shadowColor: '#4CAF50', shadowOpacity: 0.3, shadowRadius: 10, elevation: 4,
  },
  successTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', textAlign: 'center' },
  successSub: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 4 },
  previewBox: { marginHorizontal: 16, marginBottom: 16 },
  previewPlaceholder: {
    backgroundColor: '#F5F5F5', borderRadius: 16, paddingVertical: 40,
    alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dashed',
  },
  previewLabel: { fontSize: 14, color: '#888', marginTop: 8, fontWeight: '600' },
  detailsCard: {
    backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 16,
    borderWidth: 1, borderColor: '#F0F0F0', paddingHorizontal: 16, paddingVertical: 4,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
    marginBottom: 16,
  },
  detailsTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', marginTop: 12, marginBottom: 8 },
  saveBtn: {
    backgroundColor: '#4CAF50', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginHorizontal: 16,
    shadowColor: '#4CAF50', shadowOpacity: 0.25, shadowRadius: 8, elevation: 3,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  editBtn: { alignItems: 'center', marginTop: 12, paddingVertical: 8 },
  editBtnText: { fontSize: 14, fontWeight: '600', color: '#4CAF50' },
});

// ─── PDF Styles ─────────────────────────────────────────────────────────────
const pdfStyles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 24, alignItems: 'center' },
  uploadBox: {
    width: '100%', borderWidth: 2, borderColor: '#FFCDD2', borderStyle: 'dashed',
    borderRadius: 16, paddingVertical: 40, alignItems: 'center', backgroundColor: '#FFF5F5',
  },
  uploadText: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginTop: 12 },
  uploadSub: { fontSize: 13, color: '#888', marginTop: 4, marginBottom: 16 },
  chooseBtn: { backgroundColor: '#4CAF50', borderRadius: 12, paddingHorizontal: 28, paddingVertical: 12 },
  chooseBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  hint: { fontSize: 12, color: '#888', marginTop: 16, textAlign: 'center' },
});

// ─── Email Intro Styles ─────────────────────────────────────────────────────
const emailIntroStyles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 8, alignItems: 'center' },
  illustration: { height: 160, alignItems: 'center', justifyContent: 'center', position: 'relative', marginTop: 8, width: '100%' },
  illBg: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: '#E8F5E9', borderRadius: 16, overflow: 'hidden' },
  illHill: { position: 'absolute', bottom: 0, width: 140, height: 50, borderRadius: 60 },
  illDecor: { position: 'absolute', fontSize: 18 },
  heading: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', textAlign: 'center', marginTop: 8 },
  sub: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 4, marginBottom: 20, lineHeight: 20 },
  benefitsCard: {
    backgroundColor: '#fff', borderRadius: 16, width: '100%',
    borderWidth: 1, borderColor: '#F0F0F0', paddingHorizontal: 16, paddingVertical: 4,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
    marginBottom: 20,
  },
  benefitRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  benefitBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  benefitTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  benefitDesc: { fontSize: 13, color: '#888', marginTop: 2 },
  connectBtn: {
    backgroundColor: '#4CAF50', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', width: '100%',
    shadowColor: '#4CAF50', shadowOpacity: 0.25, shadowRadius: 8, elevation: 3,
  },
  connectBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

// ─── Email Results Styles ───────────────────────────────────────────────────
const emailResultsStyles = StyleSheet.create({
  banner: {
    backgroundColor: '#E8F5E9', borderRadius: 14, marginHorizontal: 16, marginTop: 8,
    padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#A5D6A7',
  },
  bannerTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  bannerSub: { fontSize: 13, color: '#666', marginTop: 2 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 16,
    borderWidth: 1, borderColor: '#F0F0F0', paddingHorizontal: 14, paddingVertical: 4,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#E0E0E0',
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
  },
  checkboxChecked: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  iconBg: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  detail: { fontSize: 13, color: '#666', marginTop: 2 },
  platform: { fontSize: 12, color: '#888', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F5F5F5' },
  importBtn: {
    backgroundColor: '#4CAF50', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginHorizontal: 16, marginTop: 20,
    shadowColor: '#4CAF50', shadowOpacity: 0.25, shadowRadius: 8, elevation: 3,
  },
  importBtnDisabled: { backgroundColor: '#C8E6C9', shadowOpacity: 0, elevation: 0 },
  importBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

// ─── Manual Screen Styles ───────────────────────────────────────────────────
const manualScreenStyles = StyleSheet.create({
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A', marginBottom: 16, textAlign: 'center' },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
    borderWidth: 1, borderColor: '#EBEBEB', backgroundColor: '#F5F5F5',
  },
  typeChipActive: { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' },
  typeText: { fontSize: 12, fontWeight: '600', color: '#666' },
  typeTextActive: { color: '#4CAF50' },
  saveBtn: {
    backgroundColor: '#4CAF50', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 8,
    shadowColor: '#4CAF50', shadowOpacity: 0.25, shadowRadius: 8, elevation: 3,
  },
  saveBtnDisabled: { backgroundColor: '#C8E6C9', shadowOpacity: 0, elevation: 0 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

// ─── Detail Styles ──────────────────────────────────────────────────────────
const detailStyles = StyleSheet.create({
  previewBox: { marginHorizontal: 16, marginBottom: 16, marginTop: 8 },
  previewPlaceholder: {
    backgroundColor: '#F5F5F5', borderRadius: 16, paddingVertical: 40,
    alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dashed',
  },
  previewLabel: { fontSize: 14, color: '#888', marginTop: 8, fontWeight: '600' },
  detailsCard: {
    backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 16,
    borderWidth: 1, borderColor: '#F0F0F0', paddingHorizontal: 16, paddingVertical: 4,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
    marginBottom: 16,
  },
  actionsRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 16 },
  actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 14 },
});

// ─── Success Styles ─────────────────────────────────────────────────────────
const successStyles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 24, alignItems: 'center' },
  illustration: { height: 180, alignItems: 'center', justifyContent: 'center', position: 'relative', width: '100%', marginBottom: 8 },
  illBg: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: '#E8F5E9', borderRadius: 16, overflow: 'hidden' },
  illHill: { position: 'absolute', bottom: 0, width: 140, height: 50, borderRadius: 60 },
  illDecor: { position: 'absolute', fontSize: 18 },
  checkCircle: {
    position: 'absolute', bottom: 20, right: '30%',
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#4CAF50',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#fff',
  },
  heading: { fontSize: 26, fontWeight: '900', color: '#1A1A1A', marginTop: 12, textAlign: 'center' },
  sub: { fontSize: 15, color: '#888', textAlign: 'center', marginTop: 6, marginBottom: 24, lineHeight: 22 },
  viewBtn: {
    backgroundColor: '#4CAF50', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', width: '100%',
    shadowColor: '#4CAF50', shadowOpacity: 0.25, shadowRadius: 8, elevation: 3,
  },
  viewBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
