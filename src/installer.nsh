# Custom NSIS script — runs before Aria installs
# Silently installs Visual C++ 2015-2022 Redistributable if not present

!macro customInstall
  # Check if VC++ redist is already installed by looking for the runtime DLL
  IfFileExists "$SYSDIR\vcruntime140.dll" VCRedistInstalled VCRedistMissing
  
  VCRedistMissing:
    DetailPrint "Installing Visual C++ Redistributable (required)..."
    
    # Download VC++ Redistributable silently
    inetc::get /SILENT \
      "https://aka.ms/vs/17/release/vc_redist.x64.exe" \
      "$TEMP\vc_redist.x64.exe" \
      /END
    
    Pop $0
    ${If} $0 == "OK"
      ExecWait '"$TEMP\vc_redist.x64.exe" /install /quiet /norestart' $1
      DetailPrint "Visual C++ Redistributable installed successfully."
      Delete "$TEMP\vc_redist.x64.exe"
    ${Else}
      DetailPrint "Could not download Visual C++ Redistributable. Screenshot feature may not work."
    ${EndIf}
  
  VCRedistInstalled:
    DetailPrint "Visual C++ Redistributable already installed."
!macroend
