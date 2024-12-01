import { StyleSheet } from 'react-native';

export default function WebView({ url }: { url: string }) {
  return (
    <iframe 
      src={url}
      style={styles.iframe}
      title="Device Manager Web Interface"
      allow="fullscreen; autoplay; clipboard-write; encrypted-media"
      sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
    />
  );
}

const styles = StyleSheet.create({
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
  }
});
