//ficha del convenio con pestañas para: datos, documentos, arbol y comentarios, ademas de acceso a firmar y subir PDF
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { usarPreferencias } from '../contexto/ContextoPreferencias';
import { EtiquetaEstado } from '../componentes/atomos/EtiquetaEstado';
import { BotonPersonalizado } from '../componentes/atomos/BotonPersonalizado';
import PantallaComentarios from './PantallaComentarios';

export default function PantallaDetalleConvenio({ route, navigation }) {
  const { idConvenio = 'MC-2026-0001' } = route.params || {};
  const { colores, factorActual } = usarPreferencias();
  const [pestaniaActiva, setPestaniaActiva] = useState('datos'); // 'datos' | 'documentos' | 'arbol' | 'comentarios'

  return (
    <View style={[estilos.contenedor, { backgroundColor: colores.fondo }]}>
      {/* Encabezado */}
      <View style={estilos.encabezado}>
        <Text style={[estilos.codigo, { color: colores.textoPrincipal, fontSize: 20 * factorActual }]}>
          {idConvenio}
        </Text>
        <EtiquetaEstado texto="Por firmar" variante="por_firmar" />
      </View>

      {/* Selector de Pestañas */}
      <View style={estilos.filaPestanias}>
        {['datos', 'documentos', 'arbol', 'comentarios'].map((pestania) => (
          <TouchableOpacity
            key={pestania}
            onPress={() => setPestaniaActiva(pestania)}
            style={[
              estilos.pestaniaBoton,
              pestaniaActiva === pestania && estilos.pestaniaActivaBoton,
            ]}
          >
            <Text
              style={[
                estilos.textoPestania,
                { color: pestaniaActiva === pestania ? '#2B6CB0' : colores.textoSecundario },
              ]}
            >
              {pestania.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Contenido según pestaña */}
      <ScrollView style={estilos.cuerpo}>
        {pestaniaActiva === 'datos' && (
          <View>
            <Text style={[estilos.etiquetaCampo, { color: colores.textoSecundario }]}>Contraparte:</Text>
            <Text style={[estilos.valorCampo, { color: colores.textoPrincipal }]}>Ministerio de Ciencia y Tecnología</Text>

            <Text style={[estilos.etiquetaCampo, { color: colores.textoSecundario }]}>Unidad Académica:</Text>
            <Text style={[estilos.valorCampo, { color: colores.textoPrincipal }]}>Facultad de Ingeniería - UNLPam</Text>

            <Text style={[estilos.etiquetaCampo, { color: colores.textoSecundario }]}>Vencimiento:</Text>
            <Text style={[estilos.valorCampo, { color: colores.textoPrincipal }]}>15/12/2027 (Preaviso: 30 días)</Text>

            <BotonPersonalizado
              titulo="FÍRMAR CONVENIO"
              alPresionar={() => navigation.navigate('FirmaConvenio', { idConvenio })}
            />
            <BotonPersonalizado
              titulo="Subir anexo PDF"
              variante="secundario"
              alPresionar={() => navigation.navigate('SubirAnexo', { idConvenio })}
            />
          </View>
        )}

        {pestaniaActiva === 'documentos' && (
          <View style={estilos.vistaVacia}>
            <Text style={{ color: colores.textoSecundario }}>Convenio_Principal.pdf (1.8 MB)</Text>
            <BotonPersonalizado titulo="Ver PDF y Zoom" variante="secundario" alPresionar={() => {}} />
          </View>
        )}

        {pestaniaActiva === 'arbol' && (
          <View style={estilos.vistaVacia}>
            <Text style={{ color: colores.textoPrincipal, fontWeight: 'bold' }}>🌳 Estructura Jerárquica</Text>
            <Text style={{ color: colores.textoSecundario }}>• {idConvenio} (Convenio Marco)</Text>
            <Text style={{ color: colores.textoSecundario }}>   └── EC-2026-0002 (Convenio Específico)</Text>
            <Text style={{ color: colores.textoSecundario }}>       └── Res. CD N° 124/26 (Resolución vinculada)</Text>
          </View>
        )}

        {pestaniaActiva === 'comentarios' && <PantallaComentarios idConvenio={idConvenio} />}
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, padding: 16 },
  encabezado: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  codigo: { fontWeight: 'bold' },
  filaPestanias: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', marginBottom: 16 },
  pestaniaBoton: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  pestaniaActivaBoton: { borderBottomWidth: 2, borderBottomColor: '#2B6CB0' },
  textoPestania: { fontWeight: 'bold', fontSize: 12 },
  cuerpo: { flex: 1 },
  etiquetaCampo: { fontSize: 12, marginTop: 10 },
  valorCampo: { fontSize: 15, fontWeight: '500', marginBottom: 6 },
  vistaVacia: { padding: 12 },
});