// Tarjeta del inicio: "¿En qué sede estás?". Detecta la sede con UNA lectura de la ubicación
// (solo si la persona toca el botón y da permiso) o deja elegirla de una lista.
// Con la sede elegida muestra la bienvenida y el acceso rápido a sus convenios.
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Linking } from 'react-native';
import { BotonPersonalizado } from '../atomos/BotonPersonalizado';
import { usarPreferencias } from '../../contexto/ContextoPreferencias';
import { detectarSede, listarUnidades, guardarSede, leerSede, olvidarSede } from '../../servicios/sedes';

const MENSAJES = {
  sin_permiso: 'La app no tiene permiso de ubicación (si lo negaste antes, Android ya no vuelve a preguntar). Podés darlo en los permisos de la app o elegir la sede a mano.',
  gps_apagado: 'La ubicación del celular está apagada. Activala desde la barra de arriba del celular, o elegí la sede a mano.',
  sin_senal: 'No se pudo leer la ubicación (adentro de un edificio puede tardar). Probá de nuevo o elegí la sede a mano.',
  lejos: 'No estás cerca de ninguna sede de la UNLPam. Podés elegirla a mano.',
};

export const TarjetaSede = ({ alVerConvenios }) => {
  const { colores, factorActual } = usarPreferencias();
  const [sede, setSede] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [unidades, setUnidades] = useState(null); // lista para elegir a mano (null = cerrada)
  const [verAjustes, setVerAjustes] = useState(false); // botón para ir a los permisos del celular

  useEffect(() => { leerSede().then(setSede); }, []);

  const elegir = async (unidad) => {
    await guardarSede(unidad);
    setSede(unidad);
    setUnidades(null);
    setMensaje('');
  };

  const detectar = async () => {
    setBuscando(true);
    setMensaje('');
    try {
      const { motivo, sede: encontrada } = await detectarSede();
      if (motivo === 'ok' && encontrada) {
        await elegir(encontrada);
        return;
      }
      setMensaje(MENSAJES[motivo === 'ok' ? 'lejos' : motivo]);
      setVerAjustes(motivo === 'sin_permiso');
      setUnidades(await listarUnidades());
    } catch (e) {
      console.warn('[sede] no se pudo detectar:', e);
      setMensaje('No se pudo obtener la ubicación. Podés elegir la sede a mano.');
      setUnidades(await listarUnidades().catch(() => []));
    } finally {
      setBuscando(false);
    }
  };

  const texto = (tam) => ({ color: colores.textoPrincipal, fontSize: tam * factorActual });

  return (
    <View style={[estilos.tarjeta, { backgroundColor: colores.tarjeta, borderColor: colores.borde }]}>
      {sede ? (
        <>
          <Text style={[texto(16), estilos.titulo]}>Bienvenido/a a {sede.nombre}</Text>
          <BotonPersonalizado titulo={`Ver convenios de ${sede.sigla}`} alPresionar={() => alVerConvenios(sede)} />
          <TouchableOpacity onPress={async () => { await olvidarSede(); setSede(null); }} accessibilityRole="button">
            <Text style={[estilos.enlace, { color: colores.acento, fontSize: 14 * factorActual }]}>Cambiar de sede</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={[texto(16), estilos.titulo]}>¿En qué sede estás?</Text>
          <Text style={{ color: colores.textoSecundario, fontSize: 13 * factorActual, marginBottom: 8 }}>
            Se mira tu ubicación una sola vez, solo cuando tocás el botón.
          </Text>
          {buscando ? (
            <ActivityIndicator color={colores.acento} style={{ marginVertical: 12 }} />
          ) : (
            <>
              <BotonPersonalizado titulo="Detectar mi sede" alPresionar={detectar} />
              <BotonPersonalizado titulo="Elegir a mano" variante="secundario"
                alPresionar={async () => setUnidades(await listarUnidades().catch(() => []))} />
            </>
          )}
          {mensaje ? <Text style={{ color: colores.textoSecundario, fontSize: 14 * factorActual, marginTop: 6 }}>{mensaje}</Text> : null}
          {verAjustes ? (
            <TouchableOpacity onPress={() => Linking.openSettings()} accessibilityRole="button">
              <Text style={[estilos.enlace, { color: colores.acento, fontSize: 14 * factorActual }]}>Abrir los permisos de la app</Text>
            </TouchableOpacity>
          ) : null}
          {unidades?.map((u) => (
            <TouchableOpacity key={u.id} onPress={() => elegir(u)} accessibilityRole="button"
              style={[estilos.opcion, { borderColor: colores.borde }]}>
              <Text style={texto(15)}>{u.nombre}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}
    </View>
  );
};

const estilos = StyleSheet.create({
  tarjeta: { borderWidth: 1, borderRadius: 10, padding: 14, marginVertical: 8 },
  titulo: { fontWeight: 'bold', marginBottom: 4 },
  enlace: { textAlign: 'center', marginTop: 6, fontWeight: '600' },
  opcion: { borderTopWidth: 1, paddingVertical: 12 },
});