import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // 배경색은 ThemeContext에서 동적으로 적용합니다.
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    // 텍스트 색상은 개별 스크린에서 override 합니다.
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    // 배경색은 동적으로 적용 (ex: theme.inputBackgroundColor)
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginLeft: 8,
    // 색상은 동적으로 적용
  },
  homeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    // 색상은 동적으로 적용
    marginBottom: 10,
    textAlign: 'center',
  },
  homeSubtitle: {
    fontSize: 16,
    // 색상은 동적으로 적용
    marginBottom: 20,
    textAlign: 'center',
  },
  homeInputContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 16,
  },
  addButton: {
    // 배경색은 동적으로 적용
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
    justifyContent: 'center',
  },
  addButtonText: {
    // 색상은 동적으로 적용
    fontWeight: 'bold',
  },
  wordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    // 배경색은 동적으로 적용
    padding: 10,
    borderRadius: 8,
  },
  wordText: {
    fontSize: 16,
    // 색상은 동적으로 적용
    flex: 1,
    marginRight: 10,
  },
  deleteText: {
    color: 'red',
    fontWeight: 'bold',
  },
});

export default styles;
