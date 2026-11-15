//ficha del convenio con datos de la API (GET /api/convenios/{id}) y pestañas para:
//datos, documentos, historial y comentarios. El botón de firmar aparece solo si la API
//dice que el usuario puede firmarlo (permisos.firmar).
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { usarPreferencias } from '../contexto/ContextoPreferencias';
import { EtiquetaEstado } from '../componentes/atomos/EtiquetaEstado';
import { BotonPersonalizado } from '../componentes/atomos/BotonPersonalizado';
import PantallaComentarios from './PantallaComentarios';
import { AyudaPuntual } from '../componentes/moleculas/AyudaPuntual';
import { verConvenio, textoEstado, fecha, TIPOS, ESTADOS, CATEGORIAS_DOCUMENTO } from '../servicios/convenios';

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
  // PDF principal más nuevo: es el que se lee antes de firmar
  const principal = [...(c.documentos ?? [])].filter((d) => d.categoria === 'principal').sort((x, y) => y.numero_version - x.numero_version)[0];

  return (
    <ScrollView
      style={{ backgroundColor: colores.fondo }}
      contentContainerStyle={estilos.contenedor}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => { setRefrescando(true); cargar(); }} tintColor={colores.acento} />}
    >
      <AyudaPuntual texto="Acá ves todos los datos del convenio, sus firmas y sus documentos (tocá uno para ver quién lo subió y su huella SHA-256). Si te toca firmar, tocá «Leer y firmar»: primero leés el PDF hasta el final y después firmás. Deslizá hacia abajo para actualizar." />
      {/* Encabezado */}
      <View style={estilos.encabezado}>
        <Text style={[texto(20), estilos.codigo]}>{c.codigo}</Text>
        <EtiquetaEstado texto={estado} variante={variante(estado)} />
      </View>
      <Text style={[texto(15), { marginBottom: 12 }]}>{c.titulo}</Text>

      {c.permisos?.firmar && (
        <BotonPersonalizado
          titulo="LEER Y FIRMAR CONVENIO"
          alPresionar={() => (principal
            // primero se lee el PDF completo; el botón Firmar aparece al final
            ? navigation.navigate('LeerPdf', { id: c.id, codigo: c.codigo, documento: principal, puedeFirmar: true })
            : navigation.navigate('FirmaConvenio', { id: c.id, idConvenio: c.codigo }))}
        />
      )}

      {/* Convenio firmado: quién, fecha, hora y lugar (lat/long) */}
      {(c.firmas ?? []).map((f) => (
        <View key={f.id} style={[tarjeta, { borderColor: colores.exitoBorde, backgroundColor: colores.exitoFondo, marginBottom: 12 }]}
          accessibilityLabel={`Firmado por ${f.usuario?.name}`}>
          <Text style={{ color: colores.exito, fontWeight: '700', fontSize: 15 * factorActual }}>✓ Firmado por {f.usuario?.name}</Text>
          <Text style={{ color: colores.exito, fontSize: 13 * factorActual }}>
            {new Date(f.firmado_en).toLocaleDateString('es-AR')} a las {new Date(f.firmado_en).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
            {f.biometria_ok ? ' · con huella o rostro' : ''}
          </Text>
          <Text style={{ color: colores.exito, fontSize: 13 * factorActual }}>
            {f.latitud != null ? `Lat ${Number(f.latitud).toFixed(5)}, long ${Number(f.longitud).toFixed(5)}` : 'Sin ubicación (no se dio permiso)'}
          </Text>
        </View>
      ))}

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

      {/* Árbol: el marco del que depende y los específicos o adendas que dependen de este */}
      {pestaniaActiva === 'datos' && (c.antecedentes?.length > 0 || c.derivados?.length > 0) && (
        <View style={[tarjeta, { marginTop: 12 }]}>
          <Text style={[texto(15), { fontWeight: 'bold', marginBottom: 8 }]}>Convenios relacionados</Text>
          {c.antecedentes?.length > 0 && <Text style={[secundario(12), { marginBottom: 4 }]}>Depende de:</Text>}
          {c.antecedentes?.map((r) => (
            <Relacionado key={`a${r.id}`} convenio={r} texto={texto} secundario={secundario}
              alPresionar={() => navigation.push('DetalleConvenio', { id: r.id, idConvenio: r.codigo })} />
          ))}
          {c.derivados?.length > 0 && <Text style={[secundario(12), { marginVertical: 4 }]}>Dependen de este:</Text>}
          {c.derivados?.map((r) => (
            <Relacionado key={`d${r.id}`} convenio={r} texto={texto} secundario={secundario}
              alPresionar={() => navigation.push('DetalleConvenio', { id: r.id, idConvenio: r.codigo })} />
          ))}
        </View>
      )}

      {pestaniaActiva === 'documentos' && c.permisos?.editar && (
        <BotonPersonalizado titulo="Subir documento PDF" variante="secundario"
          alPresionar={() => navigation.navigate('SubirAnexo', { id: c.id, codigo: c.codigo })} />
      )}

      {pestaniaActiva === 'documentos' && (
        <View style={tarjeta}>
          {(c.documentos ?? []).length === 0 ? (
            <Text style={secundario(14)}>Todavía no hay documentos cargados.</Text>
          ) : (
            c.documentos.map((d) => (
              <TouchableOpacity key={d.id} style={estilos.filaLista} accessibilityRole="button"
                accessibilityHint="Abre el PDF para leerlo o compartirlo"
                onPress={() => navigation.navigate('LeerPdf', { id: c.id, codigo: c.codigo, documento: d, puedeFirmar: false })}>
                <Text style={[texto(14), { color: colores.acento, fontWeight: '600' }]}>📄 {d.nombre_original}</Text>
                <Text style={secundario(12)}>
                  {CATEGORIAS_DOCUMENTO[d.categoria] ?? d.categoria} · versión {d.numero_version} · {(d.tamano_bytes / 1024 / 1024).toFixed(1)} MB
                </Text>
                {/* Marca que pone la API al subirlo: quién, cuándo y huella del archivo */}
                {d.marca && (
                  <Text style={secundario(12)}>
                    Subido por {d.marca.subido_por} el {new Date(d.marca.subido_en).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                    {d.sha256 ? ` · SHA-256 ${d.sha256.slice(0, 12)}…` : ''}
                  </Text>
                )}
              </TouchableOpacity>
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

function Relacionado({ convenio, texto, secundario, alPresionar }) {
  return (
    <TouchableOpacity onPress={alPresionar} accessibilityRole="link" style={{ paddingVertical: 6 }}
      accessibilityLabel={`${convenio.codigo}, ${convenio.titulo}`}>
      <Text style={[texto(14), { fontWeight: '600' }]}>
        {convenio.codigo} · {TIPOS[convenio.tipo] ?? convenio.tipo} · {ESTADOS[convenio.estado] ?? convenio.estado} ›
      </Text>
      <Text style={secundario(13)}>{convenio.titulo}</Text>
    </TouchableOpacity>
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