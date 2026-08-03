import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  visible: boolean;
  onCapture: (uri: string) => void;
  onCancel: () => void;
}

export default function FaceCapture({ visible, onCapture, onCancel }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);

  async function takePicture() {
    if (!cameraRef || busy) return;
    setBusy(true);
    try {
      const photo = await cameraRef.takePictureAsync({
        quality: 0.8,
      });
      if (photo?.uri) onCapture(photo.uri);
    } catch (e) {
      setBusy(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
      {!permission || !permission.granted ? (
        <View className="flex-1 items-center justify-center bg-slate-900 p-8">
          <Text className="text-white text-lg font-bold text-center mb-2">
            Necesitamos acceso a la cámara
          </Text>
          <Text className="text-slate-300 text-center mb-6">
            La cámara se usa para capturar tu rostro y autenticarte de forma
            biométrica.
          </Text>
          <TouchableOpacity
            className="bg-brand-600 px-6 py-3 rounded-xl"
            onPress={requestPermission}
          >
            <Text className="text-white font-bold">Otorgar permiso</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-1 bg-black">
          <CameraView
            ref={setCameraRef}
            style={{ flex: 1 }}
            facing="front"
            mirror
            mode="picture"
          >
            <View className="flex-1 items-center justify-center">
              <View
                className="rounded-full border-4 border-white/80"
                style={{ width: 260, height: 260 }}
              >
                <View
                  className="rounded-full border border-white/40 m-4"
                  style={{ flex: 1 }}
                />
              </View>
              <Text className="text-white text-sm mt-6 bg-black/40 px-4 py-2 rounded-full">
                Coloca tu rostro dentro del círculo
              </Text>
            </View>

            <View className="flex-row items-center justify-around pb-10 pt-6 bg-black/30">
              <TouchableOpacity
                className="bg-white/20 px-5 py-3 rounded-xl"
                onPress={onCancel}
              >
                <Text className="text-white font-bold">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-brand-600 px-8 py-4 rounded-full"
                onPress={takePicture}
                disabled={busy}
              >
                {busy ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-base">
                    Capturar
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      )}
    </Modal>
  );
}
