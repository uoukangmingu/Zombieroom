#include <windows.h>
#include <shlwapi.h>
#include <strsafe.h>

int WINAPI wWinMain(HINSTANCE instance, HINSTANCE previous, PWSTR commandLine, int showCommand) {
  (void)instance;
  (void)previous;
  (void)commandLine;
  (void)showCommand;

  WCHAR exePath[32768];
  WCHAR baseDir[32768];
  WCHAR gamePath[32768];
  WCHAR gameUrl[65536];
  DWORD urlLength = (DWORD)(sizeof(gameUrl) / sizeof(gameUrl[0]));

  DWORD length = GetModuleFileNameW(NULL, exePath, (DWORD)(sizeof(exePath) / sizeof(exePath[0])));
  if (!length || length >= (DWORD)(sizeof(exePath) / sizeof(exePath[0]))) {
    MessageBoxW(NULL, L"게임 실행 파일의 위치를 확인하지 못했습니다.", L"BOXHEAD", MB_OK | MB_ICONERROR);
    return 1;
  }

  StringCchCopyW(baseDir, sizeof(baseDir) / sizeof(baseDir[0]), exePath);
  PathRemoveFileSpecW(baseDir);
  if (FAILED(StringCchPrintfW(gamePath, sizeof(gamePath) / sizeof(gamePath[0]), L"%s\\client\\index.html", baseDir))) {
    MessageBoxW(NULL, L"게임 경로가 너무 깁니다.", L"BOXHEAD", MB_OK | MB_ICONERROR);
    return 1;
  }
  if (GetFileAttributesW(gamePath) == INVALID_FILE_ATTRIBUTES) {
    MessageBoxW(NULL, L"client\\index.html을 찾지 못했습니다. 압축 안의 파일 구조를 유지한 채 다시 풀어 주세요.", L"BOXHEAD", MB_OK | MB_ICONERROR);
    return 1;
  }
  if (UrlCreateFromPathW(gamePath, gameUrl, &urlLength, 0) != S_OK) {
    MessageBoxW(NULL, L"게임 주소를 만들지 못했습니다.", L"BOXHEAD", MB_OK | MB_ICONERROR);
    return 1;
  }
  HINSTANCE result = ShellExecuteW(NULL, L"open", gameUrl, NULL, baseDir, SW_SHOWNORMAL);
  if ((INT_PTR)result <= 32) {
    MessageBoxW(NULL, L"기본 웹 브라우저를 열지 못했습니다. Chrome 또는 Microsoft Edge를 설치하거나 BOXHEAD_게임실행.bat를 사용해 주세요.", L"BOXHEAD", MB_OK | MB_ICONERROR);
    return 1;
  }
  return 0;
}
