import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ANDROID_SOURCE_FILES, CodeFile } from '../data/sourceCode';
import { copyToClipboard } from '../utils/clipboard';

export const CodeViewer: React.FC = () => {
  const [selectedFileId, setSelectedFileId] = useState<string>('manifest');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const currentFile: CodeFile =
    ANDROID_SOURCE_FILES.find((f) => f.id === selectedFileId) || ANDROID_SOURCE_FILES[0];

  const handleCopy = async () => {
    const success = await copyToClipboard(currentFile.code);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const lines = currentFile.code.split('\n');
  const filteredLines = searchQuery.trim()
    ? lines
        .map((line, index) => ({ line, originalIndex: index + 1 }))
        .filter((item) => item.line.toLowerCase().includes(searchQuery.toLowerCase()))
    : lines.map((line, index) => ({ line, originalIndex: index + 1 }));

  return (
    <View style={styles.container}>
      {/* File Selector Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsScroll}
      >
        {ANDROID_SOURCE_FILES.map((file) => {
          const isSelected = file.id === selectedFileId;
          const isXml = file.language === 'xml';
          return (
            <TouchableOpacity
              key={file.id}
              activeOpacity={0.8}
              onPress={() => {
                setSelectedFileId(file.id);
                setSearchQuery('');
              }}
              style={[styles.tabButton, isSelected && styles.tabButtonActive]}
            >
              <Ionicons
                name={isXml ? 'document-text-outline' : 'logo-android'}
                size={14}
                color={isSelected ? '#00F0FF' : '#64748B'}
              />
              <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
                {file.filename}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Description & Action Bar */}
      <View style={styles.metaBar}>
        <View style={styles.metaLeft}>
          <Text style={styles.fileTitle}>{currentFile.filename}</Text>
          <Text style={styles.fileDescription} numberOfLines={2}>
            {currentFile.description}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleCopy}
          style={[styles.copyButton, copied && styles.copyButtonDone]}
        >
          <Ionicons
            name={copied ? 'checkmark' : 'copy-outline'}
            size={14}
            color={copied ? '#10B981' : '#FFFFFF'}
          />
          <Text style={[styles.copyButtonText, copied && styles.copyButtonTextDone]}>
            {copied ? 'COPIED!' : 'COPY CODE'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Key Highlights / Requirements Callout */}
      <View style={styles.highlightsContainer}>
        <Text style={styles.highlightsHeader}>KEY IMPLEMENTATION HIGHLIGHTS:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.highlightsRow}>
            {currentFile.keyHighlights.map((hl, i) => (
              <View key={i} style={styles.highlightBadge}>
                <Text style={styles.highlightTitle}>
                  L{hl.line}: {hl.title}
                </Text>
                <Text style={styles.highlightNote} numberOfLines={2}>
                  {hl.note}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Search Input */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={14} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search inside ${currentFile.filename}...`}
          placeholderTextColor="#475569"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={14} color="#64748B" />
          </TouchableOpacity>
        )}
      </View>

      {/* Code Editor Body */}
      <ScrollView
        style={styles.codeScrollView}
        horizontal
        showsHorizontalScrollIndicator={true}
      >
        <ScrollView style={styles.codeVerticalScroll} nestedScrollEnabled>
          <View style={styles.codeBlock}>
            {filteredLines.map((item, idx) => {
              const lineNum = item.originalIndex;
              const text = item.line;

              // Syntax colorizing heuristic
              let textColor = '#E2E8F0';
              if (text.trim().startsWith('//') || text.trim().startsWith('<!--')) {
                textColor = '#64748B'; // Comment
              } else if (text.includes('<uses-permission') || text.includes('<service') || text.includes('<activity')) {
                textColor = '#00F0FF'; // Manifest core
              } else if (text.includes('class ') || text.includes('fun ') || text.includes('override ')) {
                textColor = '#38BDF8'; // Kotlin keyword
              } else if (text.includes('ACTION_') || text.includes('EXTRA_')) {
                textColor = '#F59E0B'; // Action constants
              } else if (text.includes('coroutine') || text.includes('launch') || text.includes('Dispatchers')) {
                textColor = '#A855F7'; // Coroutines
              } else if (text.includes('VpnService.Builder') || text.includes('establish()')) {
                textColor = '#10B981'; // VPN Builder
              }

              return (
                <View key={idx} style={styles.codeLine}>
                  <Text style={styles.lineNumber}>{lineNum.toString().padStart(3, ' ')}</Text>
                  <Text style={[styles.codeText, { color: textColor }]}>{text}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A11',
  },
  tabsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: '#0A0F1D',
    borderBottomWidth: 1,
    borderBottomColor: '#172033',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#111726',
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#00F0FF15',
    borderColor: '#00F0FF',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tabTextActive: {
    color: '#00F0FF',
  },
  metaBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#161F30',
  },
  metaLeft: {
    flex: 1,
    marginRight: 12,
  },
  fileTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  fileDescription: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00F0FF25',
    borderWidth: 1,
    borderColor: '#00F0FF88',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 5,
  },
  copyButtonDone: {
    backgroundColor: '#10B98125',
    borderColor: '#10B98188',
  },
  copyButtonText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00F0FF',
    letterSpacing: 0.8,
  },
  copyButtonTextDone: {
    color: '#10B981',
  },
  highlightsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#0D1424',
    borderBottomWidth: 1,
    borderBottomColor: '#1A2338',
  },
  highlightsHeader: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00F0FF',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  highlightsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  highlightBadge: {
    backgroundColor: '#131C30',
    borderWidth: 1,
    borderColor: '#24324D',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    maxWidth: 220,
  },
  highlightTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  highlightNote: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1626',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 10,
    height: 34,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 11,
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  codeScrollView: {
    flex: 1,
    backgroundColor: '#060911',
  },
  codeVerticalScroll: {
    flex: 1,
  },
  codeBlock: {
    paddingVertical: 8,
    paddingRight: 30,
  },
  codeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 1,
  },
  lineNumber: {
    width: 44,
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#3B4861',
    textAlign: 'right',
    paddingRight: 12,
    userSelect: 'none',
  },
  codeText: {
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 17,
  },
});
