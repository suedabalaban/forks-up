import React, { useState, useEffect } from "react";
import { auth } from "../config/firebaseconfig";
import { 
    updateProfile, 
    updateEmail, 
    sendEmailVerification, 
    User, 
    EmailAuthProvider,
    reauthenticateWithCredential,
    sendPasswordResetEmail,
    deleteUser
} from "firebase/auth";
import { toast } from "react-hot-toast";

// Google logo component
const GoogleIcon: React.FC = () => (
    <svg className="w-5 h-5 inline-block ml-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

const Settings: React.FC = () => {
    const [displayName, setDisplayName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [currentPassword, setCurrentPassword] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showPasswordInput, setShowPasswordInput] = useState<boolean>(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
                setDisplayName(user.displayName || "");
                setEmail(user.email || "");
            }
        });

        return () => unsubscribe();
    }, []);

    const isEmailProvider = () => {
        if (!user) return false;
        const providers = user.providerData.map(provider => provider.providerId);
        return providers.includes("password");
    };

    const handleReauthenticate = async () => {
        if (!user || !user.email) return false;
        
        try {
            const credential = EmailAuthProvider.credential(
                user.email,
                currentPassword
            );
            await reauthenticateWithCredential(user, credential);
            return true;
        } catch (error: any) {
            toast.error("Şifre yanlış veya bir hata oluştu");
            return false;
        }
    };

    const handleUpdateProfile = async () => {
        if (!user) return;
        setIsLoading(true);

        try {
            // Update display name
            if (displayName !== user.displayName) {
                await updateProfile(user, {
                    displayName: displayName
                });
                toast.success("İsim başarıyla güncellendi!");
            }

            // Update email - only for email/password users
            if (email !== user.email) {
                if (!isEmailProvider()) {
                    toast.error("Google ile giriş yapan kullanıcılar email adreslerini değiştiremez");
                    setEmail(user.email || ""); // Reset email input
                    setIsLoading(false);
                    return;
                }

                if (!currentPassword) {
                    setShowPasswordInput(true);
                    setIsLoading(false);
                    return;
                }

                const isReauthenticated = await handleReauthenticate();
                if (!isReauthenticated) {
                    setIsLoading(false);
                    return;
                }

                await updateEmail(user, email);
                await sendEmailVerification(user);
                setShowPasswordInput(false);
                setCurrentPassword("");
                toast.success("Email güncelleme bağlantısı gönderildi. Lütfen email'inizi kontrol edin!");
            }
        } catch (error: any) {
            toast.error(error.message || "Bir hata oluştu");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!user?.email || !isEmailProvider()) return;
        
        try {
            await sendPasswordResetEmail(auth, user.email);
            toast.success("Şifre sıfırlama bağlantısı email adresinize gönderildi");
        } catch (error: any) {
            toast.error("Şifre sıfırlama bağlantısı gönderilemedi");
        }
    };

    const handleDeleteAccount = async () => {
        if (!user) return;

        try {
            if (isEmailProvider() && !currentPassword) {
                setShowPasswordInput(true);
                return;
            }

            if (isEmailProvider()) {
                const isReauthenticated = await handleReauthenticate();
                if (!isReauthenticated) return;
            }

            await deleteUser(user);
            toast.success("Hesabınız başarıyla silindi");
            window.location.href = "/"; // Ana sayfaya yönlendir
        } catch (error: any) {
            toast.error("Hesap silinemedi: " + error.message);
        }
    };

    if (!user) {
        return <div className="flex justify-center items-center h-screen">Lütfen giriş yapın</div>;
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Hesap Ayarları</h1>
            
            <div className="space-y-6">
                {/* Profil Bilgileri */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-lg font-semibold mb-4">Profil Bilgileri</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                İsim
                            </label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="İsminizi girin"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email {!isEmailProvider() && <GoogleIcon />}
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isEmailProvider() ? 'cursor-not-allowed bg-gray-100' : ''}`}
                                placeholder="Email adresinizi girin"
                                disabled={!isEmailProvider()}
                                title={!isEmailProvider() ? "Google hesabı ile giriş yaptığınız için email adresinizi değiştiremezsiniz" : ""}
                            />
                            {!user.emailVerified && (
                                <p className="text-yellow-600 text-sm mt-1">
                                    ⚠️ Email adresiniz doğrulanmamış
                                </p>
                            )}
                        </div>

                        {showPasswordInput && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mevcut Şifreniz (Değişiklik için gerekli)
                                </label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Mevcut şifrenizi girin"
                                />
                            </div>
                        )}

                        <button
                            onClick={handleUpdateProfile}
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {isLoading ? "Güncelleniyor..." : "Değişiklikleri Kaydet"}
                        </button>
                    </div>
                </div>

                {/* Güvenlik Ayarları */}
                {isEmailProvider() && (
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h2 className="text-lg font-semibold mb-4">Güvenlik</h2>
                        <button
                            onClick={handleResetPassword}
                            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 mb-4"
                        >
                            Şifremi Sıfırla
                        </button>
                    </div>
                )}

                {/* Hesap Silme */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-lg font-semibold mb-4">Tehlikeli Bölge</h2>
                    {!showDeleteConfirm ? (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                            Hesabımı Sil
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-red-600 text-sm">
                                ⚠️ Bu işlem geri alınamaz. Hesabınız ve tüm verileriniz kalıcı olarak silinecektir.
                            </p>
                            <div className="flex space-x-4">
                                <button
                                    onClick={handleDeleteAccount}
                                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                >
                                    Evet, Hesabımı Sil
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                >
                                    İptal
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;