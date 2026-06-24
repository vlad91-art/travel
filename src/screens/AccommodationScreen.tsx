import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Linking,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppStore, AccommodationEntry } from '../store/useAppStore';
import { Sparkle, Dot } from '../components/TravelDecorations';
import {
  SuitcaseIcon, PdfIcon, GmailIcon, EditPencilIcon, ReuseIcon,
  UploadCloudIcon, CalendarIcon, ClockIcon, MapPinIcon,
  CheckIcon, ChevronRightIcon, LockIcon, ControlIcon, LightningIcon,
  getAmenityIcon, getPlatformIcon, HouseIcon, HotelIcon, GlobeIcon,
  ArrowLeftIcon, CloseIcon, PlusIcon, DownloadIcon,
} from '../components/TravelBuddyIcons';

const { width } = Dimensions.get('window');

// ─── Constants ──────────────────────────────────────────────────────────────
const CONNECTING_FLIGHT = 'Garuda Indonesia GA408';

const PLATFORMS = ['Airbnb', 'Booking.com', 'Agoda', 'Other'];
const PLATFORM_URLS: Record<string, string> = {
  Airbnb: 'https://www.airbnb.com',
  'Booking.com': 'https://www.booking.com',
  Agoda: 'https://www.agoda.com',
};

const ALL_AMENITIES = [
  { name: 'WiFi', label: 'WiFi' },
  { name: 'Breakfast', label: 'Breakfast' },
  { name: 'Pool', label: 'Pool' },
  { name: 'AC', label: 'AC' },
  { name: 'Parking', label: 'Parking' },
  { name: 'Kitchen', label: 'Kitchen' },
  { name: 'Workspace', label: 'Workspace' },
  { name: 'Gym', label: 'Gym' },
  { name: 'Hot tub', label: 'Hot tub' },
];

const PREVIOUS_TRIPS = [
  {
    id: 'prev1',
    name: 'Villa Padi Ubud',
    location: 'Ubud, Bali',
    dates: 'May 2024',
    platform: 'Airbnb',
    nights: 4,
  },
  {
    id: 'prev2',
    name: 'The Kayon Resort',
    location: 'Ubud, Bali',
    dates: 'May 2024',
    platform: 'Booking.com',
    nights: 3,
  },
  {
    id: 'prev3',
    name: 'Lombok Beach Villa',
    location: 'Lombok, Indonesia',
    dates: 'May 2024',
    platform: 'Agoda',
    nights: 5,
  },
];

const GMAIL_RESULTS = [
  {
    id: 'g1',
    name: 'Villa Padi Ubud',
    dates: '16 – 20 May 2024',
    platform: 'Airbnb',
    selected: true,
  },
  {
    id: 'g2',
    name: 'The Kayon Resort',
    dates: '22 – 25 May 2024',
    platform: 'Booking.com',
    selected: true,
  },
  {
    id: 'g3',
    name: 'Lombok Beach Villa',
    dates: '27 – 31 May 2024',
    platform: 'Agoda',
    selected: false,
  },
];

// ─── Helper: Field component ────────────────────────────────────────────────
function F({ label, placeholder, value, onChangeText, optional, keyboardType }: {
  label: string; placeholder: string; value: string;
  onChangeText: (t: string) => void; optional?: boolean; keyboardType?: any;
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
        keyboardType={keyboardType}
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
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
});

// ─── Helper: Date/Time input with icon ──────────────────────────────────────
function DateTimeInput({ label, placeholder, value, onChangeText, icon }: {
  label: string; placeholder: string; value: string; onChangeText: (t: string) => void; icon: 'calendar' | 'clock';
}) {
  return (
    <View style={{ marginBottom: 14, flex: 1 }}>
      <Text style={fStyles.label}>{label}</Text>
      <View style={dtStyles.inputWrap}>
        {icon === 'calendar' ? <CalendarIcon size={18} color="#666" /> : <ClockIcon size={18} color="#666" />}
        <TextInput
          style={dtStyles.input}
          placeholder={placeholder}
          placeholderTextColor="#C0C0C0"
          value={value}
          onChangeText={onChangeText}
        />
      </View>
    </View>
  );
}

const dtStyles = StyleSheet.create({
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F5F5F5', borderRadius: 12, borderWidth: 1, borderColor: '#EBEBEB',
    paddingHorizontal: 12, paddingVertical: 10, gap: 8,
  },
  input: { flex: 1, fontSize: 15, color: '#1A1A1A', paddingVertical: 3 },
});

// ─── Helper: Step indicator with labels ─────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  const labels = ['Stay Details', 'Dates', 'Amenities', 'Review'];
  return (
    <View style={stepStyles.container}>
      {Array.from({ length: total }).map((_, i) => {
        const step = i + 1;
        const isActive = step === current;
        const isDone = step < current;
        return (
          <React.Fragment key={step}>
            <View style={stepStyles.stepCol}>
              <View style={[stepStyles.dot, isActive && stepStyles.dotActive, isDone && stepStyles.dotDone]}>
                {isDone ? <CheckIcon size={14} color="#fff" /> : <Text style={[stepStyles.dotText, (isActive || isDone) && stepStyles.dotTextActive]}>{step}</Text>}
              </View>
              <Text style={[stepStyles.label, isActive && stepStyles.labelActive]}>{labels[i]}</Text>
            </View>
            {step < total && (
              <View style={stepStyles.lineWrap}>
                <View style={[stepStyles.line, isDone && stepStyles.lineDone]} />
              </View>
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const stepStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', marginBottom: 24, paddingHorizontal: 16 },
  stepCol: { alignItems: 'center', flex: 1 },
  dot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' },
  dotActive: { backgroundColor: '#4CAF50' },
  dotDone: { backgroundColor: '#A5D6A7' },
  dotText: { fontSize: 12, fontWeight: '700', color: '#999' },
  dotTextActive: { color: '#fff' },
  label: { fontSize: 10, color: '#999', marginTop: 6, fontWeight: '600', textAlign: 'center' },
  labelActive: { color: '#4CAF50' },
  lineWrap: { position: 'absolute', top: 14, left: 0, right: 0, paddingHorizontal: 50, flexDirection: 'row' },
  line: { flex: 1, height: 2, backgroundColor: '#E0E0E0', marginHorizontal: 8 },
  lineDone: { backgroundColor: '#A5D6A7' },
});

// ─── Main Screen ────────────────────────────────────────────────────────────
export default function AccommodationScreen() {
  const navigation = useNavigation();
  const { accommodations, addAccommodation } = useAppStore();

  // Navigation state
  const [screen, setScreen] = useState<'overview' | 'hub' | 'pdfUpload' | 'pdfReview' | 'gmailIntro' | 'gmailResults' | 'manual1' | 'manual2' | 'manual3' | 'manual4' | 'success' | 'reuse'>('overview');

  // Manual form state
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState('Airbnb');
  const [address, setAddress] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [priceForStay, setPriceForStay] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Gmail import state
  const [gmailSelections, setGmailSelections] = useState<Record<string, boolean>>(
    Object.fromEntries(GMAIL_RESULTS.map((g) => [g.id, g.selected]))
  );

  const toggleAmenity = (amenityName: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityName) ? prev.filter((a) => a !== amenityName) : [...prev, amenityName]
    );
  };

  const resetForm = useCallback(() => {
    setName(''); setPlatform('Airbnb'); setAddress('');
    setCheckInDate(''); setCheckInTime('');
    setCheckOutDate(''); setCheckOutTime('');
    setBookingRef(''); setPriceForStay('');
    setSelectedAmenities([]);
  }, []);

  const handleSaveManual = () => {
    addAccommodation({
      name, platform, address,
      checkInDate, checkInTime,
      checkOutDate, checkOutTime,
      bookingRef,
      priceForStay: priceForStay || undefined,
      amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
      status: 'UPCOMING',
    });
    resetForm();
    setScreen('success');
  };

  const handleImportGmail = () => {
    const selected = GMAIL_RESULTS.filter((g) => gmailSelections[g.id]);
    selected.forEach((g) => {
      addAccommodation({
        name: g.name,
        platform: g.platform,
        address: 'Imported from Gmail',
        checkInDate: g.dates.split('–')[0].trim(),
        checkInTime: '',
        checkOutDate: g.dates.split('–')[1]?.trim() || '',
        checkOutTime: '',
        bookingRef: '',
        status: 'UPCOMING',
      });
    });
    setScreen('success');
  };

  const handleConfirmPdfImport = () => {
    addAccommodation({
      name: 'Villa Padi Ubud',
      platform: 'Airbnb',
      address: 'Jl. Monkey Forest, Ubud\nGianyar, Bali 80571',
      checkInDate: '16 May 2024',
      checkInTime: '19:00',
      checkOutDate: '20 May 2024',
      checkOutTime: '11:00',
      bookingRef: '#VPU123456',
      priceForStay: '€480',
      nights: 4,
      status: 'UPCOMING',
    });
    setScreen('success');
  };

  const handleReuseTrip = (trip: typeof PREVIOUS_TRIPS[0]) => {
    addAccommodation({
      name: trip.name,
      platform: trip.platform,
      address: trip.location,
      checkInDate: '',
      checkInTime: '',
      checkOutDate: '',
      checkOutTime: '',
      bookingRef: '',
      status: 'UPCOMING',
    });
    setScreen('success');
  };

  const goToOverview = () => {
    setScreen('overview');
    resetForm();
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────

  // ── 1. OVERVIEW ──
  if (screen === 'overview') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeftIcon size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Accommodation</Text>
          <TouchableOpacity onPress={() => setScreen('hub')}>
            <PlusIcon size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {accommodations.map((acc) => (
            <AccommodationCard key={acc.id} acc={acc} />
          ))}

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── 2. ADD HUB ──
  if (screen === 'hub') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={goToOverview}>
            <ArrowLeftIcon size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Accommodation</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Illustration */}
          <View style={hubStyles.illustration}>
            <View style={hubStyles.illBg}>
              <View style={[hubStyles.illHill, { left: -10, backgroundColor: '#C8E6C9' }]} />
              <View style={[hubStyles.illHill, { right: -10, backgroundColor: '#A5D6A7', width: 100 }]} />
            </View>
            <SuitcaseIcon size={72} color="#4CAF50" />
            <Sparkle color="#FFD700" size={14} style={{ position: 'absolute', left: 30, top: 20 }} />
            <Sparkle color="#4CAF50" size={10} style={{ position: 'absolute', right: 40, top: 16 }} />
          </View>

          <Text style={hubStyles.heading}>Add Accommodation</Text>
          <Text style={hubStyles.sub}>Choose how you want to add your stay</Text>

          {/* Options */}
          <View style={hubStyles.optionsCard}>
            <HubOption
              icon={<PdfIcon size={22} />}
              title="Import booking confirmation"
              subtitle="Upload PDF from Airbnb, Booking, Agoda and more"
              onPress={() => setScreen('pdfUpload')}
            />
            <HubOption
              icon={<GmailIcon size={22} />}
              title="Import from Gmail"
              subtitle="Find accommodation emails from your inbox"
              onPress={() => setScreen('gmailIntro')}
            />
            <HubOption
              icon={<EditPencilIcon size={22} />}
              title="Add manually"
              subtitle="Enter accommodation details yourself"
              onPress={() => setScreen('manual1')}
            />
            <HubOption
              icon={<ReuseIcon size={22} />}
              title="Reuse from previous trips"
              subtitle="Add a place you've stayed before"
              onPress={() => setScreen('reuse')}
              last
            />
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

  // ── 3. PDF UPLOAD ──
  if (screen === 'pdfUpload') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setScreen('hub')}>
            <ArrowLeftIcon size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Import from PDF</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView contentContainerStyle={pdfStyles.content} showsVerticalScrollIndicator={false}>
          {/* Illustration */}
          <View style={pdfStyles.illustration}>
            <View style={pdfStyles.illBg}>
              <View style={[pdfStyles.illHill, { left: -10, backgroundColor: '#C8E6C9' }]} />
              <View style={[pdfStyles.illHill, { right: -10, backgroundColor: '#A5D6A7', width: 100 }]} />
            </View>
            <PdfIcon size={72} color="#F44336" />
            <Sparkle color="#FFD700" size={14} style={{ position: 'absolute', left: 30, top: 20 }} />
            <Sparkle color="#4CAF50" size={10} style={{ position: 'absolute', right: 40, top: 16 }} />
          </View>

          <Text style={pdfStyles.heading}>Upload booking confirmation</Text>
          <Text style={pdfStyles.sub}>We'll extract the details for you</Text>

          {/* Mobile-friendly upload */}
          <TouchableOpacity style={pdfStyles.uploadBox} onPress={() => setScreen('pdfReview')} activeOpacity={0.8}>
            <UploadCloudIcon size={48} color="#4CAF50" />
            <Text style={pdfStyles.uploadText}>Tap to upload your PDF</Text>
            <Text style={pdfStyles.uploadSub}>Browse files from your device</Text>
            <View style={pdfStyles.chooseBtn}>
              <Text style={pdfStyles.chooseBtnText}>Choose file</Text>
            </View>
          </TouchableOpacity>

          <Text style={pdfStyles.hint}>Works with Airbnb, Booking.com, Agoda and more</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── 4. PDF REVIEW ──
  if (screen === 'pdfReview') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setScreen('pdfUpload')}>
            <ArrowLeftIcon size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Review & Confirm</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View style={reviewStyles.hero}>
            <View style={reviewStyles.heroBg}>
              <View style={[reviewStyles.heroHill, { left: -10, backgroundColor: '#C8E6C9' }]} />
              <View style={[reviewStyles.heroHill, { right: -10, backgroundColor: '#A5D6A7', width: 100 }]} />
            </View>
            <HouseIcon size={72} color="#4CAF50" />
            <Sparkle color="#FFD700" size={14} style={{ position: 'absolute', left: 20, top: 20 }} />
            <Sparkle color="#4CAF50" size={10} style={{ position: 'absolute', right: 30, top: 16 }} />
          </View>

          <Text style={reviewStyles.foundText}>We found these details in your PDF</Text>

          {/* Details card */}
          <View style={reviewStyles.detailsCard}>
            <ReviewRow label="Property name" value="Villa Padi Ubud" />
            <ReviewRow label="Platform" value="Airbnb" icon={<HouseIcon size={16} color="#4CAF50" />} />
            <ReviewRow label="Address" value="Jl. Monkey Forest, Ubud\nGianyar, Bali 80571" />
            <ReviewRow label="Check-in" value="16 May 2024 · 19:00" />
            <ReviewRow label="Check-out" value="20 May 2024 · 11:00" />
            <ReviewRow label="Price (for stay)" value="€480" />
            <ReviewRow label="Nights" value="4 nights" />
            <ReviewRow label="Booking reference" value="#VPU123456" last />
          </View>

          <TouchableOpacity style={reviewStyles.confirmBtn} onPress={handleConfirmPdfImport}>
            <Text style={reviewStyles.confirmBtnText}>Confirm Import</Text>
          </TouchableOpacity>

          <TouchableOpacity style={reviewStyles.editBtn} onPress={() => setScreen('manual1')}>
            <Text style={reviewStyles.editBtnText}>Looks wrong? Edit details</Text>
          </TouchableOpacity>

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── 5. GMAIL INTRO ──
  if (screen === 'gmailIntro') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setScreen('hub')}>
            <ArrowLeftIcon size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Import from Gmail</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView contentContainerStyle={gmailIntroStyles.content} showsVerticalScrollIndicator={false}>
          {/* Illustration */}
          <View style={gmailIntroStyles.illustration}>
            <View style={gmailIntroStyles.illBg}>
              <View style={[gmailIntroStyles.illHill, { left: -10, backgroundColor: '#C8E6C9' }]} />
              <View style={[gmailIntroStyles.illHill, { right: -10, backgroundColor: '#A5D6A7', width: 100 }]} />
            </View>
            <GmailIcon size={72} color="#EA4335" />
            <Sparkle color="#FFD700" size={14} style={{ position: 'absolute', left: 30, top: 20 }} />
            <Sparkle color="#4CAF50" size={10} style={{ position: 'absolute', right: 40, top: 16 }} />
          </View>

          <Text style={gmailIntroStyles.heading}>Find accommodations{'\n'}in your inbox</Text>
          <Text style={gmailIntroStyles.sub}>We'll look for booking confirmations and add them to your trip</Text>

          {/* Benefits */}
          <View style={gmailIntroStyles.benefitsCard}>
            <BenefitItem icon={<LockIcon size={22} color="#4CAF50" />} title="Secure & private" desc="We only read booking emails" />
            <BenefitItem icon={<ControlIcon size={22} color="#FF9800" />} title="You're in control" desc="Choose what to import" />
            <BenefitItem icon={<LightningIcon size={22} color="#FFEB3B" />} title="Fast & easy" desc="Save time and stay organized" last />
          </View>

          <TouchableOpacity style={gmailIntroStyles.connectBtn} onPress={() => setScreen('gmailResults')}>
            <Text style={gmailIntroStyles.connectBtnText}>Connect Gmail</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── 6. GMAIL RESULTS ──
  if (screen === 'gmailResults') {
    const selectedCount = Object.values(gmailSelections).filter(Boolean).length;
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setScreen('gmailIntro')}>
            <ArrowLeftIcon size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Import from Gmail</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={gmailResultsStyles.banner}>
            <Text style={gmailResultsStyles.bannerTitle}>Found 3 accommodations</Text>
            <Text style={gmailResultsStyles.bannerSub}>Select what you want to import</Text>
          </View>

          <View style={gmailResultsStyles.card}>
            {GMAIL_RESULTS.map((item, index) => (
              <View key={item.id}>
                <TouchableOpacity
                  style={gmailResultsStyles.row}
                  onPress={() => setGmailSelections((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                  activeOpacity={0.7}
                >
                  <View style={[gmailResultsStyles.checkbox, gmailSelections[item.id] && gmailResultsStyles.checkboxChecked]}>
                    {gmailSelections[item.id] && <CheckIcon size={14} color="#fff" />}
                  </View>
                  <View style={gmailResultsStyles.iconBg}>
                    {getPlatformIcon(item.platform, 24)}
                  </View>
                  <View style={gmailResultsStyles.info}>
                    <Text style={gmailResultsStyles.name}>{item.name}</Text>
                    <Text style={gmailResultsStyles.dates}>{item.dates}</Text>
                    <Text style={gmailResultsStyles.platform}>{item.platform}</Text>
                  </View>
                </TouchableOpacity>
                {index < GMAIL_RESULTS.length - 1 && <View style={gmailResultsStyles.divider} />}
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[gmailResultsStyles.importBtn, selectedCount === 0 && gmailResultsStyles.importBtnDisabled]}
            onPress={handleImportGmail}
            disabled={selectedCount === 0}
          >
            <Text style={gmailResultsStyles.importBtnText}>Import {selectedCount} selected</Text>
          </TouchableOpacity>

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── 7. REUSE PREVIOUS TRIPS ──
  if (screen === 'reuse') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setScreen('hub')}>
            <ArrowLeftIcon size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Reuse Previous Trips</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={reuseStyles.subtitle}>Select a place you've stayed before</Text>

          <View style={reuseStyles.card}>
            {PREVIOUS_TRIPS.map((trip, index) => (
              <View key={trip.id}>
                <TouchableOpacity
                  style={reuseStyles.row}
                  onPress={() => handleReuseTrip(trip)}
                  activeOpacity={0.7}
                >
                  <View style={reuseStyles.iconBg}>
                    {getPlatformIcon(trip.platform, 28)}
                  </View>
                  <View style={reuseStyles.info}>
                    <Text style={reuseStyles.name}>{trip.name}</Text>
                    <Text style={reuseStyles.location}>{trip.location}</Text>
                    <View style={reuseStyles.metaRow}>
                      <Text style={reuseStyles.meta}>{trip.dates}</Text>
                      <Text style={reuseStyles.meta}> · {trip.nights} nights</Text>
                    </View>
                  </View>
                  <ChevronRightIcon size={20} />
                </TouchableOpacity>
                {index < PREVIOUS_TRIPS.length - 1 && <View style={reuseStyles.divider} />}
              </View>
            ))}
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── 8. MANUAL STEP 1 ──
  if (screen === 'manual1') {
    const canContinue = name.trim() && platform && address.trim();
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setScreen('hub')}>
            <CloseIcon size={22} />
          </TouchableOpacity>
          <Text style={styles.title}>Add Manually</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <StepIndicator current={1} total={4} />

          <Text style={manualStyles.sectionTitle}>Stay Details</Text>

          <F label="Property name" placeholder="e.g. Villa Padi Ubud" value={name} onChangeText={setName} />

          <Text style={fStyles.label}>Platform</Text>
          <View style={manualStyles.platformRow}>
            {PLATFORMS.map((p) => (
              <TouchableOpacity
                key={p}
                style={[manualStyles.platformChip, platform === p && manualStyles.platformChipActive]}
                onPress={() => setPlatform(p)}
              >
                {getPlatformIcon(p, 18)}
                <Text style={[manualStyles.platformText, platform === p && manualStyles.platformTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <F label="Address" placeholder="Enter full address" value={address} onChangeText={setAddress} />

          <TouchableOpacity
            style={[manualStyles.continueBtn, !canContinue && manualStyles.continueBtnDisabled]}
            onPress={() => setScreen('manual2')}
            disabled={!canContinue}
          >
            <Text style={manualStyles.continueBtnText}>Continue</Text>
          </TouchableOpacity>

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── 9. MANUAL STEP 2 ──
  if (screen === 'manual2') {
    const canContinue = checkInDate.trim() && checkOutDate.trim();
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setScreen('manual1')}>
            <ArrowLeftIcon size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Add Manually</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <StepIndicator current={2} total={4} />

          <Text style={manualStyles.sectionTitle}>Dates</Text>

          <View style={fStyles.row}>
            <DateTimeInput label="Check-in date" placeholder="16 May 2024" value={checkInDate} onChangeText={setCheckInDate} icon="calendar" />
            <DateTimeInput label="Check-in time" placeholder="19:00" value={checkInTime} onChangeText={setCheckInTime} icon="clock" />
          </View>

          <View style={fStyles.row}>
            <DateTimeInput label="Check-out date" placeholder="20 May 2024" value={checkOutDate} onChangeText={setCheckOutDate} icon="calendar" />
            <DateTimeInput label="Check-out time" placeholder="11:00" value={checkOutTime} onChangeText={setCheckOutTime} icon="clock" />
          </View>

          <View style={manualStyles.btnRow}>
            <TouchableOpacity style={manualStyles.backBtn2} onPress={() => setScreen('manual1')}>
              <Text style={manualStyles.backBtn2Text}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[manualStyles.continueBtn2, !canContinue && manualStyles.continueBtnDisabled]}
              onPress={() => setScreen('manual3')}
              disabled={!canContinue}
            >
              <Text style={manualStyles.continueBtn2Text}>Continue</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── 10. MANUAL STEP 3 ──
  if (screen === 'manual3') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setScreen('manual2')}>
            <ArrowLeftIcon size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Add Manually</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <StepIndicator current={3} total={4} />

          <Text style={manualStyles.sectionTitle}>Extras & Amenities</Text>
          <Text style={manualStyles.sectionSub}>Select what's included</Text>

          <View style={manualStyles.amenitiesGrid}>
            {ALL_AMENITIES.map((a) => (
              <TouchableOpacity
                key={a.name}
                style={[manualStyles.amenityChip, selectedAmenities.includes(a.name) && manualStyles.amenityChipActive]}
                onPress={() => toggleAmenity(a.name)}
              >
                {getAmenityIcon(a.name, 22)}
                <Text style={[manualStyles.amenityText, selectedAmenities.includes(a.name) && manualStyles.amenityTextActive]}>
                  {a.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <F label="Booking reference" placeholder="e.g. #VPU123456" value={bookingRef} onChangeText={setBookingRef} optional />
          <F label="Price (for stay)" placeholder="e.g. €480" value={priceForStay} onChangeText={setPriceForStay} optional />

          <View style={manualStyles.btnRow}>
            <TouchableOpacity style={manualStyles.backBtn2} onPress={() => setScreen('manual2')}>
              <Text style={manualStyles.backBtn2Text}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={manualStyles.continueBtn2} onPress={() => setScreen('manual4')}>
              <Text style={manualStyles.continueBtn2Text}>Continue</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── 11. MANUAL STEP 4 (REVIEW) ──
  if (screen === 'manual4') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setScreen('manual3')}>
            <ArrowLeftIcon size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Add Manually</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <StepIndicator current={4} total={4} />

          <Text style={manualStyles.sectionTitle}>Review</Text>
          <Text style={manualStyles.sectionSub}>Confirm your accommodation details</Text>

          <View style={reviewStyles.detailsCard}>
            <ReviewRow label="Property name" value={name} />
            <ReviewRow label="Platform" value={platform} icon={getPlatformIcon(platform, 16)} />
            <ReviewRow label="Address" value={address} />
            <ReviewRow label="Check-in" value={`${checkInDate} ${checkInTime ? '· ' + checkInTime : ''}`} />
            <ReviewRow label="Check-out" value={`${checkOutDate} ${checkOutTime ? '· ' + checkOutTime : ''}`} />
            {selectedAmenities.length > 0 && (
              <ReviewRow label="Amenities" value={selectedAmenities.join(', ')} />
            )}
            {bookingRef ? <ReviewRow label="Booking reference" value={bookingRef} /> : null}
            {priceForStay ? <ReviewRow label="Price" value={priceForStay} last /> : <ReviewRow label="Price" value="—" last />}
          </View>

          <TouchableOpacity style={reviewStyles.confirmBtn} onPress={handleSaveManual}>
            <Text style={reviewStyles.confirmBtnText}>Save Accommodation</Text>
          </TouchableOpacity>

          <TouchableOpacity style={reviewStyles.editBtn} onPress={() => setScreen('manual1')}>
            <Text style={reviewStyles.editBtnText}>Edit details</Text>
          </TouchableOpacity>

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── 12. SUCCESS ──
  if (screen === 'success') {
    const lastAdded = accommodations[0];
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={successStyles.content} showsVerticalScrollIndicator={false}>
          {/* Illustration */}
          <View style={successStyles.illustration}>
            <View style={successStyles.illBg}>
              <View style={[successStyles.illHill, { left: -10, backgroundColor: '#C8E6C9' }]} />
              <View style={[successStyles.illHill, { right: -10, backgroundColor: '#A5D6A7', width: 100 }]} />
            </View>
            <HouseIcon size={80} color="#4CAF50" />
            <View style={successStyles.checkCircle}>
              <CheckIcon size={20} color="#fff" />
            </View>
            <Sparkle color="#FFD700" size={14} style={{ position: 'absolute', left: 30, top: 20 }} />
            <Sparkle color="#4CAF50" size={10} style={{ position: 'absolute', right: 40, top: 16 }} />
          </View>

          <Text style={successStyles.heading}>All set!</Text>
          <Text style={successStyles.sub}>Your accommodation has been added{'\n'}to your trip.</Text>

          {/* Card preview */}
          <View style={successStyles.previewCard}>
            <View style={successStyles.previewHeader}>
              <Text style={successStyles.previewName}>{lastAdded?.name || 'Villa Padi Ubud'}</Text>
              <View style={successStyles.previewBadge}>
                <Text style={successStyles.previewBadgeText}>UPCOMING</Text>
              </View>
            </View>
            <Text style={successStyles.previewDates}>
              {lastAdded?.checkInDate || '16 – 20 May 2024'} · {lastAdded?.nights || 4} nights
            </Text>
            <View style={successStyles.previewAddressRow}>
              <MapPinIcon size={16} color="#F44336" />
              <Text style={successStyles.previewAddress} numberOfLines={2}>
                {lastAdded?.address || 'Jl. Monkey Forest, Ubud\nGianyar, Bali 80571'}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={successStyles.viewBtn} onPress={goToOverview}>
            <Text style={successStyles.viewBtnText}>View in Accommodation</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function AccommodationCard({ acc }: { acc: AccommodationEntry }) {
  const platformUrl = PLATFORM_URLS[acc.platform];

  const openPlatform = () => {
    if (platformUrl) Linking.openURL(platformUrl);
  };

  const openMaps = () => {
    const query = encodeURIComponent(acc.address);
    Linking.openURL(`https://maps.google.com/?q=${query}`);
  };

  const displayedAmenities = acc.amenities && acc.amenities.length > 0
    ? ALL_AMENITIES.filter((a) => acc.amenities?.includes(a.name))
    : ALL_AMENITIES.slice(0, 4);

  return (
    <View style={cardStyles.card}>
      {/* Hero with photo or illustration */}
      <View style={cardStyles.heroContainer}>
        {acc.photoUrl ? (
          <Image source={{ uri: acc.photoUrl }} style={cardStyles.heroImage} resizeMode="cover" />
        ) : null}
        <View style={[cardStyles.heroOverlay, !acc.photoUrl && cardStyles.heroOverlayNoImage]}>
          <View style={cardStyles.heroScene}>
            {!acc.photoUrl && (
              <>
                <View style={cardStyles.sky} />
                <View style={cardStyles.ground} />
                <View style={[cardStyles.hill, { left: -10, backgroundColor: '#81C784' }]} />
                <View style={[cardStyles.hill, { right: -10, backgroundColor: '#66BB6A', width: 120 }]} />
              </>
            )}
            <HouseIcon size={64} color="#fff" />
            <Sparkle color="#FFD700" size={12} style={{ position: 'absolute', right: 30, top: 18 }} />
          </View>
        </View>
      </View>

      {/* Name + status */}
      <View style={cardStyles.nameRow}>
        <Text style={cardStyles.propertyName}>{acc.name}</Text>
        <View style={cardStyles.statusBadge}>
          <Text style={cardStyles.statusText}>UPCOMING</Text>
        </View>
      </View>

      {/* Check-in/out */}
      <View style={cardStyles.checkCard}>
        <View style={cardStyles.checkRow}>
          <View style={cardStyles.checkItem}>
            <Text style={cardStyles.checkLabel}>Check-in</Text>
            <Text style={cardStyles.checkTime}>{acc.checkInTime}</Text>
            <Text style={cardStyles.checkDay}>{acc.checkInDate}</Text>
          </View>
          <View style={cardStyles.checkDivider} />
          <View style={cardStyles.checkItem}>
            <Text style={cardStyles.checkLabel}>Check-out</Text>
            <Text style={cardStyles.checkTime}>{acc.checkOutTime}</Text>
            <Text style={cardStyles.checkDay}>{acc.checkOutDate}</Text>
          </View>
        </View>
      </View>

      {/* Connecting flight hint */}
      <View style={cardStyles.connectionHint}>
        <View style={cardStyles.dotGreen} />
        <Text style={cardStyles.connectionText}>Arriving via: {CONNECTING_FLIGHT}</Text>
      </View>

      {/* Address */}
      <View style={cardStyles.addressRow}>
        <View style={cardStyles.addressIconBg}>
          <MapPinIcon size={20} color="#F44336" />
        </View>
        <Text style={cardStyles.addressText} numberOfLines={2}>{acc.address}</Text>
      </View>
      <TouchableOpacity style={cardStyles.mapsButton} onPress={openMaps}>
        <Text style={cardStyles.mapsButtonText}>Open in Maps</Text>
      </TouchableOpacity>

      {/* Amenities */}
      <View style={cardStyles.amenitiesRow}>
        {displayedAmenities.map((a) => (
          <View key={a.name} style={cardStyles.amenityChip}>
            {getAmenityIcon(a.name, 18)}
            <Text style={cardStyles.amenityName}>{a.name}</Text>
          </View>
        ))}
      </View>

      {/* Booking ref + platform button */}
      <View style={cardStyles.bookingRow}>
        <View>
          <Text style={cardStyles.bookingLabel}>Booking confirmation</Text>
          <Text style={cardStyles.bookingRef}>{acc.bookingRef || '—'}</Text>
        </View>
        <View style={cardStyles.bookingActions}>
          {platformUrl ? (
            <TouchableOpacity style={cardStyles.platformBtn} onPress={openPlatform}>
              {getPlatformIcon(acc.platform, 16)}
              <Text style={cardStyles.platformBtnText}>Open in {acc.platform}</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={cardStyles.downloadBtn}>
            <DownloadIcon size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Hub Option ─────────────────────────────────────────────────────────────
function HubOption({ icon, title, subtitle, onPress, last }: {
  icon: React.ReactNode; title: string; subtitle: string; onPress: () => void; last?: boolean;
}) {
  return (
    <TouchableOpacity style={[hubStyles.option, !last && hubStyles.optionBorder]} onPress={onPress} activeOpacity={0.7}>
      <View style={hubStyles.optionIconBg}>
        {icon}
      </View>
      <View style={hubStyles.optionTextWrap}>
        <Text style={hubStyles.optionTitle}>{title}</Text>
        <Text style={hubStyles.optionSubtitle}>{subtitle}</Text>
      </View>
      <ChevronRightIcon size={20} />
    </TouchableOpacity>
  );
}

// ─── Review Row ─────────────────────────────────────────────────────────────
function ReviewRow({ label, value, icon, last }: { label: string; value: string; icon?: React.ReactNode; last?: boolean }) {
  return (
    <View style={[reviewStyles.row, !last && reviewStyles.rowBorder]}>
      <Text style={reviewStyles.rowLabel}>{label}</Text>
      <View style={reviewStyles.rowValueWrap}>
        {icon}
        <Text style={reviewStyles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

// ─── Benefit Item ───────────────────────────────────────────────────────────
function BenefitItem({ icon, title, desc, last }: { icon: React.ReactNode; title: string; desc: string; last?: boolean }) {
  return (
    <View style={[gmailIntroStyles.benefitRow, !last && gmailIntroStyles.benefitBorder]}>
      {icon}
      <View style={{ marginLeft: 12 }}>
        <Text style={gmailIntroStyles.benefitTitle}>{title}</Text>
        <Text style={gmailIntroStyles.benefitDesc}>{desc}</Text>
      </View>
    </View>
  );
}

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

// ─── Card Styles ────────────────────────────────────────────────────────────
const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginTop: 16,
    borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    marginBottom: 8,
  },
  heroContainer: { height: 180, overflow: 'hidden', position: 'relative' },
  heroImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.15)' },
  heroOverlayNoImage: { backgroundColor: 'transparent' },
  heroScene: { flex: 1, position: 'relative', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  sky: { ...StyleSheet.absoluteFillObject, backgroundColor: '#81D4FA' },
  ground: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, backgroundColor: '#A5D6A7' },
  hill: { position: 'absolute', bottom: 0, width: 140, height: 70, borderRadius: 50 },

  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  propertyName: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', flex: 1, marginRight: 10 },
  statusBadge: { backgroundColor: '#F3E5F5', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 10, fontWeight: '800', color: '#9C27B0', letterSpacing: 0.3 },

  checkCard: { marginHorizontal: 16, marginBottom: 12 },
  checkRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 14, padding: 14 },
  checkItem: { flex: 1, alignItems: 'center' },
  checkLabel: { fontSize: 11, color: '#888', marginBottom: 4 },
  checkTime: { fontSize: 22, fontWeight: '800', color: '#1A1A1A' },
  checkDay: { fontSize: 12, color: '#666', marginTop: 2 },
  checkDivider: { width: 1, height: 50, backgroundColor: '#E0E0E0', marginHorizontal: 16 },

  connectionHint: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginBottom: 12,
  },
  dotGreen: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#4CAF50' },
  connectionText: { fontSize: 13, color: '#4CAF50', fontWeight: '600' },

  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginBottom: 10 },
  addressIconBg: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' },
  addressText: { flex: 1, fontSize: 13, color: '#333', lineHeight: 19 },
  mapsButton: { backgroundColor: '#4CAF50', borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginHorizontal: 16, marginBottom: 12 },
  mapsButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  amenitiesRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginHorizontal: 16, marginBottom: 14 },
  amenityChip: { flex: 1, alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 12, paddingVertical: 8, gap: 3 },
  amenityName: { fontSize: 10, fontWeight: '600', color: '#666' },

  bookingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 16, marginBottom: 16 },
  bookingLabel: { fontSize: 11, color: '#888', marginBottom: 4 },
  bookingRef: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  bookingActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  platformBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#E8F5E9', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7,
  },
  platformBtnText: { fontSize: 12, fontWeight: '700', color: '#4CAF50' },
  downloadBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
});

// ─── Hub Styles ─────────────────────────────────────────────────────────────
const hubStyles = StyleSheet.create({
  illustration: { height: 160, alignItems: 'center', justifyContent: 'center', position: 'relative', marginTop: 8 },
  illBg: { position: 'absolute', bottom: 0, left: 16, right: 16, height: 80, backgroundColor: '#E8F5E9', borderRadius: 16, overflow: 'hidden' },
  illHill: { position: 'absolute', bottom: 0, width: 140, height: 50, borderRadius: 60 },
  illDecor: { position: 'absolute', fontSize: 18 },
  heading: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', textAlign: 'center', marginTop: 8 },
  sub: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 4, marginBottom: 16 },
  optionsCard: {
    backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 16,
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  option: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14 },
  optionBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  optionIconBg: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  optionTextWrap: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  optionSubtitle: { fontSize: 12, color: '#888', marginTop: 2 },
  optionChevron: { fontSize: 22, color: '#CCC', fontWeight: '300' },
});

// ─── PDF Upload Styles ──────────────────────────────────────────────────────
const pdfStyles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 8, alignItems: 'center' },
  illustration: { height: 160, alignItems: 'center', justifyContent: 'center', position: 'relative', marginTop: 8, width: '100%' },
  illBg: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: '#E8F5E9', borderRadius: 16, overflow: 'hidden' },
  illHill: { position: 'absolute', bottom: 0, width: 140, height: 50, borderRadius: 60 },
  illDecor: { position: 'absolute', fontSize: 18 },
  heading: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', textAlign: 'center', marginTop: 8 },
  sub: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 4, marginBottom: 20 },
  uploadBox: {
    width: '100%', borderWidth: 2, borderColor: '#A5D6A7', borderStyle: 'dashed',
    borderRadius: 16, paddingVertical: 32, alignItems: 'center', backgroundColor: '#FAFFF8',
  },
  uploadText: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginTop: 12 },
  uploadSub: { fontSize: 13, color: '#888', marginTop: 4, marginBottom: 16 },
  chooseBtn: { backgroundColor: '#4CAF50', borderRadius: 12, paddingHorizontal: 28, paddingVertical: 12 },
  chooseBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  hint: { fontSize: 12, color: '#888', marginTop: 16, textAlign: 'center' },
});

// ─── Review Styles ──────────────────────────────────────────────────────────
const reviewStyles = StyleSheet.create({
  hero: { height: 160, alignItems: 'center', justifyContent: 'center', position: 'relative', marginTop: 8, marginHorizontal: 16 },
  heroBg: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: '#E8F5E9', borderRadius: 16, overflow: 'hidden' },
  heroHill: { position: 'absolute', bottom: 0, width: 140, height: 50, borderRadius: 60 },
  heroDecor: { position: 'absolute', fontSize: 24 },
  foundText: { fontSize: 14, color: '#4CAF50', fontWeight: '600', textAlign: 'center', marginBottom: 16 },
  detailsCard: {
    backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 16,
    borderWidth: 1, borderColor: '#F0F0F0', paddingHorizontal: 16, paddingVertical: 4,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  rowLabel: { fontSize: 13, color: '#888', flex: 1 },
  rowValueWrap: { flexDirection: 'row', alignItems: 'center', maxWidth: '55%', gap: 6 },
  rowValue: { fontSize: 13, fontWeight: '600', color: '#1A1A1A', textAlign: 'right' },
  confirmBtn: {
    backgroundColor: '#4CAF50', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginHorizontal: 16, marginTop: 20,
    shadowColor: '#4CAF50', shadowOpacity: 0.25, shadowRadius: 8, elevation: 3,
  },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  editBtn: { alignItems: 'center', marginTop: 12, paddingVertical: 8 },
  editBtnText: { fontSize: 14, fontWeight: '600', color: '#4CAF50' },
});

// ─── Gmail Intro Styles ─────────────────────────────────────────────────────
const gmailIntroStyles = StyleSheet.create({
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

// ─── Gmail Results Styles ───────────────────────────────────────────────────
const gmailResultsStyles = StyleSheet.create({
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
  dates: { fontSize: 13, color: '#666', marginTop: 2 },
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

// ─── Reuse Styles ───────────────────────────────────────────────────────────
const reuseStyles = StyleSheet.create({
  subtitle: { fontSize: 14, color: '#888', marginHorizontal: 16, marginTop: 8, marginBottom: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 16,
    borderWidth: 1, borderColor: '#F0F0F0', paddingHorizontal: 14, paddingVertical: 4,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  iconBg: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  location: { fontSize: 13, color: '#666', marginTop: 2 },
  metaRow: { flexDirection: 'row', marginTop: 3 },
  meta: { fontSize: 12, color: '#888' },
  divider: { height: 1, backgroundColor: '#F5F5F5' },
});

// ─── Manual Styles ──────────────────────────────────────────────────────────
const manualStyles = StyleSheet.create({
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A', marginBottom: 4, textAlign: 'center' },
  sectionSub: { fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 16 },
  platformRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  platformChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
    borderWidth: 1, borderColor: '#EBEBEB', backgroundColor: '#F5F5F5',
  },
  platformChipActive: { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' },
  platformText: { fontSize: 13, fontWeight: '600', color: '#666' },
  platformTextActive: { color: '#4CAF50' },
  continueBtn: {
    backgroundColor: '#4CAF50', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 8,
    shadowColor: '#4CAF50', shadowOpacity: 0.25, shadowRadius: 8, elevation: 3,
  },
  continueBtnDisabled: { backgroundColor: '#C8E6C9', shadowOpacity: 0, elevation: 0 },
  continueBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  backBtn2: {
    flex: 1, borderRadius: 14, paddingVertical: 16, alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E0E0E0', backgroundColor: '#fff',
  },
  backBtn2Text: { fontSize: 16, fontWeight: '600', color: '#666' },
  continueBtn2: {
    flex: 1, backgroundColor: '#4CAF50', borderRadius: 14, paddingVertical: 16, alignItems: 'center',
    shadowColor: '#4CAF50', shadowOpacity: 0.25, shadowRadius: 8, elevation: 3,
  },
  continueBtn2Text: { color: '#fff', fontSize: 16, fontWeight: '700' },
  amenitiesGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16, justifyContent: 'space-between',
  },
  amenityChip: {
    width: (width - 32 - 20) / 3,
    aspectRatio: 1,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F5F5F5', borderRadius: 14, borderWidth: 1.5, borderColor: 'transparent',
    gap: 4,
  },
  amenityChipActive: { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' },
  amenityText: { fontSize: 11, fontWeight: '600', color: '#666', marginTop: 2 },
  amenityTextActive: { color: '#4CAF50' },
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
  previewCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, width: '100%',
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
    marginBottom: 20,
  },
  previewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  previewName: { fontSize: 17, fontWeight: '800', color: '#1A1A1A', flex: 1 },
  previewBadge: { backgroundColor: '#F3E5F5', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  previewBadgeText: { fontSize: 10, fontWeight: '800', color: '#9C27B0', letterSpacing: 0.3 },
  previewDates: { fontSize: 13, color: '#888', marginBottom: 10 },
  previewAddressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  previewAddress: { flex: 1, fontSize: 13, color: '#555', lineHeight: 19 },
  viewBtn: {
    backgroundColor: '#4CAF50', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', width: '100%',
    shadowColor: '#4CAF50', shadowOpacity: 0.25, shadowRadius: 8, elevation: 3,
  },
  viewBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
