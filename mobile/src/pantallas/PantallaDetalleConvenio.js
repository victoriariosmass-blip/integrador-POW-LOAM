//ficha del convenio con datos de la API (GET /api/convenios/{id}) y pestañas para:
//datos, documentos, historial y comentarios. El botón de firmar aparece solo si la API
//dice que el usuario puede firmarlo (permisos.firmar).
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { usarPreferencias } from '../contexto/ContextoPreferencias';
import { EtiquetaEstado } from '../componentes/atomos/EtiquetaEstado';
import { BotonPersonalizado } from '../componentes/atomos/BotonPersonalizado';
import PantallaComentarios from './PantallaComentarios';
import { verConvenio, textoEstado, fecha, TIPOS, ESTADOS } from '../servicios/convenios';

const PESTANIAS = [
  { clave: 'datos', titulo: 'DATOS' },
  { clave: 'documentos', titulo: 'DOCUMENTOS' },
  { clave: 'historial', titulo: 'HISTORIAL' },
  { clave: 'comentarios', titulo: 'COMENTARIOS' },
];

// "Por firmar" -> "por_firmar" (variante de la etiqueta)
const variante = (texto) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, '_');

export default function PantallaDetalleConvenio({ route, navigation }) {
  const { id, idConvenio } = route.params || {};
  const { colores, factorActual } = usarPreferencias();
  const [pestaniaActiva, setPestaniaActiva] = useState('datos');
  const [convenio, setConvenio] = useState(null);
  const [error, setError] = useState('');
  const [refrescando, setRefrescando] = useState(false);

  const cargar = useCallback(async () => {
    if (!id) {
      setError('No se reconoce el convenio.');
      return;
    }
    setError('');
    try {
      setConvenio(await verConvenio(id));
    } catch (e) {
      if (e.status === 403) setError('No tenés permiso para ver este convenio.');
      else if (e.status === 404) setError('El convenio no existe.');
      else setError(e.message || 'No se pudo cargar el convenio.');
    } finally {
      setRefrescando(false);
    }
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  // Al volver de la firma se recarga (cambia el estado y el historial)
  useEffect(() => navigation.addListener('focus', cargar), [navigation, cargar]);

  // Título de la barra de arriba con el código del convenio
  useEffect(() => {
    navigation.setOptions({ title: convenio?.codigo ?? idConvenio ?? 'Ficha del convenio' });
  }, [navigation, convenio, idConvenio]);

  const texto = (tamanio) => ({ color: colores.textoPrincipal, fontSize: tamanio * factorActual });
  const secundario = (tamanio) => ({ color: colores.textoSecundario, fontSize: tamanio * factorActual });
  const tarjeta = [estilos.tarjetaContenido, { backgroundColor: colores.tarjeta, borderColor: colores.borde }];

  if (error) {
    return (
      <View style={[estilos.centro, { backgroundColor: colores.fondo }]}>
        <Text style={[texto(15), { textAlign: 'center', marginBottom: 12 }]}>{error}</Text>
        <BotonPersonalizado titulo="Reintentar" variante="secundario" alPresionar={cargar} />
      </View>
    );
  }

  if (!convenio) {
    return (
      <View style={[estilos.centro, { backgroundColor: colores.fondo }]}>
        <ActivityIndicator size="large" color={colores.acento} />
      </View>
    );
  }

  const c = convenio;
  const estado = textoEstado(c);
  const contrapartes = (c.partes ?? []).filter((p) => p.tipo !== 'universidad');

  return (
    <ScrollView
      style={{ backgroundColor: colores.fondo }}
      contentContainerStyle={estilos.contenedor}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => { setRefrescando(true); cargar(); }} tintColor={colores.acento} />}
    >
      {/* Encabezado */}
      <View style={estilos.encabezado}>
        <Text style={[texto(20), estilos.codigo]}>{c.codigo}</Text>
        <EtiquetaEstado texto={estado} variante={variante(estado)} />
      </View>
      <Text style={[texto(15), { marginBottom: 12 }]}>{c.titulo}</Text>

      {c.permisos?.firmar && (
        <BotonPersonalizado
          titulo="FIRMAR CONVENIO"
          alPresionar={() => navigation.navigate('FirmaConvenio', { id: c.id, idConvenio: c.codigo })}
        />
      )}

      {/* Selector de pestañas */}
      <View style={[estilos.filaPestanias, { borderBottomColor: colores.borde }]} accessibilityRole="tablist">
        {PESTANIAS.map((p) => {
          const activa = pestaniaActiva === p.clave;
          return (
            <TouchableOpacity
              key={p.clave}
              accessibilityRole="tab"
              accessibilityState={{ selected: activa }}
              onPress={() => setPestaniaActiva(p.clave)}
              style={[estilos.pestaniaBoton, activa && { borderBottomWidth: 2, borderColor: colores.acento }]}
            >
              <Text style={[estilos.textoPestania, { color: activa ? colores.acento : colores.textoSecundario }]}>{p.titulo}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {pestaniaActiva === 'datos' && (
        <View style={tarjeta}>
          <Campo etiqueta="Tipo" valor={TIPOS[c.tipo] ?? c.tipo} texto={texto} secundario={secundario} />
          <Campo etiqueta="Unidad académica" valor={c.unidad?.nombre} texto={texto} secundario={secundario} />
          <Campo
            etiqueta={contrapartes.length > 1 ? 'Contrapartes' : 'Contraparte'}
            valor={contrapartes.map((p) => p.nombre).join('\n')}
            texto={texto} secundario={secundario}
          />
          <Campo etiqueta="Fecha de firma" valor={fecha(c.fecha_firma) ?? 'Sin firmar'} texto={texto} secundario={secundario} />
          <Campo
            etiqueta="Vencimiento"
            valor={c.fecha_vencimiento
              ? `${fecha(c.fecha_vencimiento)}${c.dias_preaviso ? ` (preaviso: ${c.dias_preaviso} días)` : ''}`
              : 'Sin vencimiento registrado'}
            texto={texto} secundario={secundario}
          />
          <Campo etiqueta="Objeto" valor={c.objeto} texto={texto} secundario={secundario} />
          {(c.partes ?? []).some((p) => p.pivot?.representante_nombre) && (
            <Campo
              etiqueta="Firmantes"
              valor={(c.partes ?? [])
                .filter((p) => p.pivot?.representante_nombre)
                .map((p) => `${p.pivot.representante_nombre} (${p.pivot.representante_cargo ?? p.nombre})`)
                .join('\n')}
              texto={texto} secundario={secundario}
            />
          )}
        </View>
      )}

      {pestaniaActiva === 'documentos' && (
        <View style={tarjeta}>
          {(c.documentos ?? []).length === 0 ? (
            <Text style={secundario(14)}>Todavía no hay documentos cargados.</Text>
          ) : (
            c.documentos.map((d) => (
              <View key={d.id} style={estilos.filaLista}>
                <Text style={texto(14)}>📄 {d.nombre_original}</Text>
                <Text style={secundario(12)}>
                  {d.categoria} · versión {d.numero_version} · {(d.tamano_bytes / 1024 / 1024).toFixed(1)} MB
                </Text>
              </View>
            ))
          )}
        </View>
      )}

      {pestaniaActiva === 'historial' && (
        <View style={tarjeta}>
          {(c.transiciones ?? []).length === 0 ? (
            <Text style={secundario(14)}>Todavía no hay cambios de estado.</Text>
          ) : (
            [...c.transiciones].reverse().map((t) => (
              <View key={t.id} style={estilos.filaLista}>
                <Text style={[texto(14), { fontWeight: '600' }]}>{ESTADOS[t.estado_hasta] ?? t.estado_hasta}</Text>
                <Text style={texto(13)}>{t.fundamento}</Text>
                <Text style={secundario(12)}>{t.usuario?.name} · {fecha(t.created_at)}</Text>
              </View>
            ))
          )}
        </View>
      )}

      {pestaniaActiva === 'comentarios' && <PantallaComentarios id={c.id} puedeComentar={c.permisos?.comentar} />}
    </ScrollView>
  );
}

function Campo({ etiqueta, valor, texto, secundario }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={secundario(12)}>{etiqueta}</Text>
      <Text style={[texto(15), { fontWeight: '500' }]}>{valor || '—'}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { padding: 16, flexGrow: 1 },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  encabezado: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  codigo: { fontWeight: 'bold' },
  filaPestanias: { flexDirection: 'row', borderBottomWidth: 1, marginVertical: 16 },
  pestaniaBoton: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  textoPestania: { fontWeight: 'bold', fontSize: 11 },
  tarjetaContenido: { borderWidth: 1, borderRadius: 12, padding: 16 },
  filaLista: { marginBottom: 12 },
});