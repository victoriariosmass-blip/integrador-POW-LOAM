// Sostenibilidad institucional (adaptación del requisito de monetización): no hay cobros reales.
// Es un módulo SIMULADO que estima cuánto papel, tiempo y traslados ahorra gestionar los
// convenios en el sistema. Parte de la cantidad real de convenios que el usuario puede ver y
// deja cambiarla para simular otros escenarios. Los supuestos están a la vista.
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { TarjetaMetrica } from '../componentes/moleculas/TarjetaMetrica';
import { usarPreferencias } from '../contexto/ContextoPreferencias';
import { listarConvenios } from '../servicios/convenios';

// Supuestos por cada convenio gestionado en el sistema en vez de en papel
const SUPUESTOS = {
  hojas: { valor: 25, texto: 'hojas de papel por convenio (original, copias para cada parte y expediente)' },
  horas: { valor: 4, texto: 'horas de gestión por convenio (buscar en el archivo, armar el expediente y seguir los vencimientos a mano)' },
  traslados: { valor: 2, texto: 'traslados por convenio (llevar el papel a la firma y devolverlo)' },
  costoHora: { valor: 8000, texto: 'pesos por hora de trabajo administrativo (valor de referencia)' },
};

const numero = (n) => n.toLocaleString('es-AR');

export default function PantallaSostenibilidad() {
  const { colores, factorActual } = usarPreferencias();
  const [reales, setReales] = useState(null); // convenios que el usuario puede ver
  const [cantidad, setCantidad] = useState(0); // la que se usa en la simulación
  const [error, setError] = useState('');

  useEffect(() => {
    listarConvenios()
      .then((lista) => { setReales(lista.length); setCantidad(lista.length); })
      .catch(() => { setError('No se pudo leer la cantidad de convenios; se simula con 10.'); setReales(10); setCantidad(10); });
  }, []);

  const texto = (t) => ({ color: colores.textoPrincipal, fontSize: t * factorActual });
  const secundario = (t) => ({ color: colores.textoSecundario, fontSize: t * factorActual });
  const cambiar = (delta) => setCantidad((c) => Math.max(1, c + delta));

  const horas = cantidad * SUPUESTOS.horas.valor;

  return (
    <ScrollView style={{ backgroundColor: colores.fondo }} contentContainerStyle={estilos.contenedor}>
      <Text style={[estilos.titulo, texto(20)]}>Sostenibilidad institucional</Text>
      <Text style={[estilos.aclaracion, secundario(13)]}>
        Módulo simulado: estima el ahorro de gestionar los convenios en el sistema en lugar de en papel.
        Son valores aproximados, no mediciones reales.
      </Text>

      {reales === null ? (
        <ActivityIndicator size="large" color={colores.acento} style={{ marginVertical: 24 }} />
      ) : (
        <>
          {error ? <Text style={[secundario(13), { marginBottom: 8 }]}>{error}</Text> : null}

          {/* Simulador: cantidad de convenios */}
          <View style={[estilos.simulador, { backgroundColor: colores.tarjeta, borderColor: colores.borde }]}>
            <Text style={[texto(14), { fontWeight: '600', flex: 1 }]}>Convenios gestionados</Text>
            <TouchableOpacity onPress={() => cambiar(-5)} style={[estilos.paso, { borderColor: colores.borde }]}
              accessibilityRole="button" accessibilityLabel="Restar 5 convenios">
              <Text style={[texto(18), { fontWeight: '700' }]}>−</Text>
            </TouchableOpacity>
            <Text style={[texto(20), estilos.cantidad]} accessibilityLiveRegion="polite">{cantidad}</Text>
            <TouchableOpacity onPress={() => cambiar(5)} style={[estilos.paso, { borderColor: colores.borde }]}
              accessibilityRole="button" accessibilityLabel="Sumar 5 convenios">
              <Text style={[texto(18), { fontWeight: '700' }]}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={[secundario(12), { marginBottom: 12 }]}>
            {cantidad === reales ? `Son los ${reales} convenios que podés ver hoy.` : `Simulación (hoy podés ver ${reales}).`}
            {cantidad !== reales ? ' ' : ''}
            {cantidad !== reales && (
              <Text onPress={() => setCantidad(reales)} style={{ color: colores.acento, fontWeight: '600' }}>Volver al valor real</Text>
            )}
          </Text>

          <View style={estilos.grilla}>
            <TarjetaMetrica titulo="Hojas de papel ahorradas" valor={numero(cantidad * SUPUESTOS.hojas.valor)} />
            <TarjetaMetrica titulo="Horas de gestión ahorradas" valor={`${numero(horas)} hs`} />
            <TarjetaMetrica titulo="Costo administrativo evitado" valor={`$ ${numero(horas * SUPUESTOS.costoHora.valor)}`} />
            <TarjetaMetrica titulo="Traslados evitados" valor={numero(cantidad * SUPUESTOS.traslados.valor)} />
          </View>

          <Text style={[texto(16), { fontWeight: '700', marginTop: 16, marginBottom: 6 }]}>Supuestos utilizados</Text>
          <View style={[estilos.supuestos, { backgroundColor: colores.tarjeta, borderColor: colores.borde }]}>
            {Object.entries(SUPUESTOS).map(([clave, s]) => (
              <Text key={clave} style={[texto(13), { marginBottom: 6 }]}>
                • <Text style={{ fontWeight: '700' }}>{numero(s.valor)}</Text> {s.texto}
              </Text>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { padding: 16, paddingBottom: 32 },
  titulo: { fontWeight: '800', marginBottom: 6 },
  aclaracion: { marginBottom: 16 },
  simulador: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 16, padding: 12, marginBottom: 6 },
  paso: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  cantidad: { fontWeight: '800', minWidth: 56, textAlign: 'center' },
  grilla: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  supuestos: { borderWidth: 1, borderRadius: 16, padding: 14 },
});
