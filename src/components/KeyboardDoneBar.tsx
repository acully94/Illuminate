import { InputAccessoryView, Keyboard, Platform, Pressable, StyleSheet, Text } from 'react-native';

/** Shared nativeID — multiple TextInputs on one screen can all reference the same bar. */
export const KEYBOARD_DONE_ID = 'illuminate-keyboard-done';

/** iOS only — Android's keyboard already has its own dismiss affordances (back button, done key). */
export function KeyboardDoneBar() {
  if (Platform.OS !== 'ios') return null;

  return (
    <InputAccessoryView nativeID={KEYBOARD_DONE_ID}>
      <Pressable style={styles.bar} onPress={() => Keyboard.dismiss()} hitSlop={8}>
        <Text style={styles.doneText}>Done</Text>
      </Pressable>
    </InputAccessoryView>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F1F1F1',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#CCC',
  },
  doneText: {
    color: '#1B3A5C',
    fontWeight: '700',
    fontSize: 16,
  },
});
