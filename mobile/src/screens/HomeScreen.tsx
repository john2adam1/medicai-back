import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { startScenario, setApiUrl, getApiUrl } from '../services/api';
import { AIScenario } from '../types/simulation';
import { UserProfile } from '../types/auth';

interface HomeScreenProps {
  currentUser?: UserProfile | null;
  onLogout?: () => void;
  onOpenAuth?: () => void;
  onStartSimulation: (scenario: AIScenario, language: string) => void;
}

const PRESET_CASES = [
  {
    title: 'Miokard Infarkti',
    desc: 'Ko\'krakda o\'tkir og\'riq, hansirash va sovuq ter',
    topic: 'O\'tkir Miokard Infarkti (ST elevated MI)',
    difficulty: 'Medium' as const,
  },
  {
    title: 'Anafilaktik Shok',
    desc: 'Dori qabulidan so\'ng toshma, gipotoniya va bronxospazm',
    topic: 'Anafilaktik shok (O\'tkir allergik reaksiya)',
    difficulty: 'Hard' as const,
  },
  {
    title: 'Pnevmoniya & Nafas Yetishmovchiligi',
    desc: 'Yuqori isitma, yo\'tal va SpO2 pasayishi',
    topic: 'O\'tkir Pnevmoniya (O\'tkir nafas yetishmovchiligi)',
    difficulty: 'Easy' as const,
  },
  {
    title: 'Gipoglikemik Koma',
    desc: 'Qandli diabeti bor bemor xushini yo\'qotishi',
    topic: 'Gipoglikemik Koma',
    difficulty: 'Medium' as const,
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  currentUser,
  onLogout,
  onOpenAuth,
  onStartSimulation,
}) => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [language, setLanguage] = useState<string>('uz');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [customHost, setCustomHost] = useState(getApiUrl());

  const handleStart = async (selectedTopic?: string, selectedDiff?: 'Easy' | 'Medium' | 'Hard') => {
    const finalTopic = selectedTopic || topic;
    const finalDiff = selectedDiff || difficulty;

    if (!finalTopic.trim()) {
      Alert.alert('Xatolik', 'Iltimos, klinik holat yoki kasallik mavzusini kiriting!');
      return;
    }

    setLoading(true);
    try {
      const scenario = await startScenario(finalTopic.trim(), finalDiff, 30, language);
      onStartSimulation(scenario, language);
    } catch (err: any) {
      Alert.alert('Xatolik yuz berdi', err.message || 'Backend API ga ulanib bo\'lmadi. Server yoqilganini va Host manzilini tekshiring.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHost = () => {
    setApiUrl(customHost.trim());
    setShowSettings(false);
    Alert.alert('Saqlandi', `API Manzil yangilandi: ${customHost}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>M</Text>
            </View>
            <View>
              <Text style={styles.appTitle}>MedicAI</Text>
              <Text style={styles.appSubtitle}>Klinik Simulyatsiya Platformasi</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setShowSettings(!showSettings)} style={styles.settingsBtn}>
            <Text style={styles.settingsBtnText}>⚙️ API Host</Text>
          </TouchableOpacity>
        </View>

        {/* User Auth Profile Bar */}
        <View style={styles.userBar}>
          {currentUser ? (
            <View style={styles.userInfoRow}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.userName} numberOfLines={1}>
                  {currentUser.fullName}
                </Text>
                <Text style={styles.userRole}>
                  {currentUser.courseLevel || (currentUser.role === 'doctor' ? 'Shifokor' : 'Talaba')}
                </Text>
              </View>
              {onLogout && (
                <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
                  <Text style={styles.logoutText}>Chiqish</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.guestBarRow}>
              <Text style={styles.guestStatusText}>👤 Mehmon rejimi</Text>
              {onOpenAuth && (
                <TouchableOpacity onPress={onOpenAuth} style={styles.loginHeaderBtn}>
                  <Text style={styles.loginHeaderBtnText}>Kirish / Ro'yxatdan o'tish →</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Custom Host Settings Drawer */}
        {showSettings && (
          <View style={styles.settingsCard}>
            <Text style={styles.settingsTitle}>Backend Server Manzili</Text>
            <TextInput
              style={styles.hostInput}
              value={customHost}
              onChangeText={setCustomHost}
              placeholder="http://192.168.1.X:3000/api"
              placeholderTextColor="#64748B"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.saveHostBtn} onPress={handleSaveHost}>
              <Text style={styles.saveHostBtnText}>Saqlash</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Language Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SIMULYATSIYA TILI</Text>
          <View style={styles.pillsRow}>
            {[
              { id: 'uz', label: '🇺🇿 O\'zbekcha' },
              { id: 'ru', label: '🇷🇺 Русский' },
              { id: 'en', label: '🇬🇧 English' },
            ].map((lang) => (
              <TouchableOpacity
                key={lang.id}
                style={[styles.pill, language === lang.id && styles.pillActive]}
                onPress={() => setLanguage(lang.id)}
              >
                <Text style={[styles.pillText, language === lang.id && styles.pillTextActive]}>
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Start Presets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TAYYOR SHOSHILINCH CASE'LAR</Text>
          {PRESET_CASES.map((preset, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.presetCard}
              onPress={() => handleStart(preset.topic, preset.difficulty)}
              disabled={loading}
            >
              <View style={styles.presetHeader}>
                <Text style={styles.presetTitle}>{preset.title}</Text>
                <View
                  style={[
                    styles.diffBadge,
                    preset.difficulty === 'Hard'
                      ? styles.diffHard
                      : preset.difficulty === 'Medium'
                      ? styles.diffMedium
                      : styles.diffEasy,
                  ]}
                >
                  <Text style={styles.diffText}>{preset.difficulty}</Text>
                </View>
              </View>
              <Text style={styles.presetDesc}>{preset.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Case Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MAXSUS KLINIK HOLAT KIRITING</Text>
          <TextInput
            style={styles.input}
            placeholder="Masalan: O'tkir appenditsit, Gipertonik kriz..."
            placeholderTextColor="#64748B"
            value={topic}
            onChangeText={setTopic}
          />

          <Text style={[styles.sectionTitle, { marginTop: 12 }]}>MURAKKABLIK DARAJASI</Text>
          <View style={styles.pillsRow}>
            {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
              <TouchableOpacity
                key={diff}
                style={[styles.pill, difficulty === diff && styles.pillActive]}
                onPress={() => setDifficulty(diff)}
              >
                <Text style={[styles.pillText, difficulty === diff && styles.pillTextActive]}>
                  {diff === 'Easy' ? 'Oson (Easy)' : diff === 'Medium' ? 'O\'rta (Medium)' : 'Murakkab (Hard)'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.startBtn, loading && styles.startBtnDisabled]}
            onPress={() => handleStart()}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.startBtnText}>⚡ SIMULYATSIYANI BOSHLASH</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  appTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
  },
  appSubtitle: {
    color: '#0EA5E9',
    fontSize: 12,
    fontWeight: '600',
  },
  settingsBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  settingsBtnText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  settingsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#0EA5E9',
  },
  settingsTitle: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  hostInput: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 10,
  },
  saveHostBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  saveHostBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  pillActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  pillText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  presetCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  presetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  presetTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  presetDesc: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 16,
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  diffEasy: { backgroundColor: 'rgba(16, 185, 129, 0.2)' },
  diffMedium: { backgroundColor: 'rgba(245, 158, 11, 0.2)' },
  diffHard: { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
  diffText: { color: '#F8FAFC', fontSize: 10, fontWeight: '800' },
  input: {
    backgroundColor: '#1E293B',
    color: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  startBtn: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  startBtnDisabled: {
    opacity: 0.6,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  userBar: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  userName: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  userRole: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '700',
  },
  guestBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guestStatusText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  loginHeaderBtn: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  loginHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

