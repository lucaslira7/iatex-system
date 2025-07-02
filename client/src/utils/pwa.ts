// PWA Utils para IA.TEX
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

class PWAManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;

  constructor() {
    this.init();
  }

  private init() {
    this.registerServiceWorker();
    this.setupInstallPrompt();
    this.checkIfInstalled();
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('IA.TEX PWA: Service Worker registrado', registration.scope);
        
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateAvailable();
              }
            });
          }
        });
      } catch (error) {
        console.log('IA.TEX PWA: Erro ao registrar Service Worker', error);
      }
    }
  }

  private setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.hideInstallButton();
      this.trackInstallation();
    });
  }

  private checkIfInstalled() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSPWA = (window.navigator as any).standalone === true;
    
    this.isInstalled = isStandalone || isIOSPWA;
    
    if (this.isInstalled) {
      this.hideInstallButton();
    }
  }

  public async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    this.deferredPrompt.prompt();
    const choiceResult = await this.deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('IA.TEX PWA: Usuário aceitou instalar');
      this.trackInstallation();
    } else {
      console.log('IA.TEX PWA: Usuário rejeitou instalar');
    }

    this.deferredPrompt = null;
    return choiceResult.outcome === 'accepted';
  }

  private showInstallButton() {
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      installButton.style.display = 'block';
    }
    this.showInstallBanner();
  }

  private hideInstallButton() {
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      installButton.style.display = 'none';
    }
  }

  private showInstallBanner() {
    if (document.getElementById('pwa-install-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.className = 'fixed top-0 left-0 right-0 bg-blue-600 text-white p-3 z-50 flex items-center justify-between';
    banner.innerHTML = `
      <div class="flex items-center space-x-3">
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
        </svg>
        <span>Instale o IA.TEX no seu celular para acesso rápido!</span>
      </div>
      <div class="flex items-center space-x-2">
        <button id="pwa-install-now" class="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium">
          Instalar
        </button>
        <button id="pwa-install-close" class="text-white hover:text-gray-200">
          ✕
        </button>
      </div>
    `;

    document.body.appendChild(banner);

    document.getElementById('pwa-install-now')?.addEventListener('click', () => {
      this.promptInstall();
      banner.remove();
    });

    document.getElementById('pwa-install-close')?.addEventListener('click', () => {
      banner.remove();
      localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
    });

    setTimeout(() => {
      if (document.getElementById('pwa-install-banner')) {
        banner.remove();
      }
    }, 10000);
  }

  private showUpdateAvailable() {
    const updateBanner = document.createElement('div');
    updateBanner.className = 'fixed bottom-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
    updateBanner.innerHTML = `
      <div class="flex items-start space-x-3">
        <svg class="w-6 h-6 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
        </svg>
        <div>
          <h4 class="font-medium">Nova versão disponível!</h4>
          <p class="text-sm text-green-100">Recarregue para atualizar o IA.TEX</p>
          <button class="mt-2 bg-white text-green-600 px-3 py-1 rounded text-sm font-medium" onclick="window.location.reload()">
            Atualizar Agora
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(updateBanner);

    setTimeout(() => {
      if (updateBanner.parentNode) {
        updateBanner.remove();
      }
    }, 30000);
  }

  private trackInstallation() {
    // Analytics - rastrear instalação
    try {
      if (typeof (window as any).gtag !== 'undefined') {
        (window as any).gtag('event', 'pwa_install', {
          event_category: 'PWA',
          event_label: 'App Installed'
        });
      }
    } catch (error) {
      console.log('Analytics not available');
    }
    this.showInstallSuccess();
  }

  private showInstallSuccess() {
    const successMessage = document.createElement('div');
    successMessage.className = 'fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50';
    successMessage.innerHTML = `
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <span>IA.TEX instalado com sucesso!</span>
      </div>
    `;

    document.body.appendChild(successMessage);

    setTimeout(() => {
      if (successMessage.parentNode) {
        successMessage.remove();
      }
    }, 5000);
  }

  public getInstallStatus() {
    return {
      isInstalled: this.isInstalled,
      canInstall: !!this.deferredPrompt,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches
    };
  }

  public isPWACapable(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }
}

export const pwaManager = new PWAManager();

export const isPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
};

export const isOnline = () => navigator.onLine;

export const getNetworkStatus = () => {
  return {
    online: navigator.onLine,
    connectionType: (navigator as any).connection?.effectiveType || 'unknown'
  };
};