import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // Detect iOS devices
        
        const isIOSDevice =
            /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
        setIsIOS(isIOSDevice);

        // Handle beforeinstallprompt for Android/desktop
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowModal(true);
        };

        // Show iOS prompt if not in standalone mode
        if (isIOSDevice && !window.matchMedia('(display-mode: standalone)').matches) {
            setShowModal(true);
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            setDeferredPrompt(null);
            setShowModal(false);
        }
    };

    const handleClose = () => setShowModal(false);

    return (
        <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {isIOS ? 'Install the app' : 'Add to Home Screen'}
                    </DialogTitle>
                    <DialogDescription>
                        {isIOS ? (
                            <>
                                To install this app on your iPhone/iPad:
                                <ol className="list-decimal pl-5 mt-2">
                                    <li>
                                        Tap the <strong>Share</strong> button in Safari.
                                    </li>
                                    <li>
                                        Select <strong>Add to Home Screen</strong>.
                                    </li>
                                    <li>
                                        Confirm by tapping <strong>Add</strong>.
                                    </li>
                                </ol>
                            </>
                        ) : (
                            'Install our app for the best experience and quick access from your home screen.'
                        )}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    {isIOS ? (
                        <Button variant="outline" onClick={handleClose}>
                            Close
                        </Button>
                    ) : (
                        <>
                            <Button variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button onClick={handleInstallClick}>Install</Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default InstallPrompt;