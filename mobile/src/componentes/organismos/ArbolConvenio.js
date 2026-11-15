// Resultado del buscador en forma de árbol: el convenio y, al desplegarlo, su convenio padre
// (marco o el que modifica), sus hijos (específicos, adendas, renovaciones), su resolución y
// todos sus documentos. Enunciado de LOAM: "el resultado de la búsqueda ... debe figurar como un
// árbol, teniendo en cuenta convenio padre, convenio hijo, resoluciones asignadas a él, y todo tipo
// de documentación asignada al convenio".
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { EtiquetaEstado } from '../atomos/EtiquetaEstado';
import { usarPreferencias } from '../../contexto/ContextoPreferencias';
import { verConvenio, textoEstado, CATEGORIAS_DOCUMENTO } from '../../servicios/convenios';

const variante = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, '_');

export const ArbolConvenio = ({ convenio, navigation }) => {
  const { colores, factorActual } = usarPreferencias();
  const [abierto, setAbierto] = useState(false);
  const [ficha, setFicha] = useState(null);
  const [error, setError] = useState('');

  const texto = (t, extra = {}) => ({ color: colores.textoPrincipal, fontSize: t * factorActual, ...extra });
  const secundario = (t) => ({ color: colores.textoSecundario, fontSize: t * factorActual });
  const estado = textoEstado(convenio);

  const alternar = async () => {
    setAbierto((a) => !a);
    if (ficha || abierto) return;
    try {
      setFicha(await verConvenio(convenio.id));
    } catch (e) {
      setError(e.message || 'No se pudo cargar');
    }
  };

  const abrir = (c) => navigation.push('DetalleConvenio', { id: c.id, idConvenio: c.codigo });

  const rama = (etiqueta, hijos) => (
    <View style={estilos.rama}>
      <Text style={[secundario(12), { fontWeight: '700', marginBottom: 2 }]}>{etiqueta}</Text>
      {hijos}
    </View>
  );

  return (
    <View style={[estilos.nodo, { backgroundColor: colores.tarjeta, borderColor: colores.borde }]}>
      <View style={estilos.fila}>
        <TouchableOpacity onPress={alternar} style={estilos.flecha} accessibilityRole="button"
          accessibilityLabel={abierto ? `Plegar ${convenio.codigo}` : `Desplegar ${convenio.codigo}`} accessibilityState={{ expanded: abierto }}>
          <Text style={texto(16, { color: colores.acento })}>{abierto ? '▾' : '▸'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 1 }} onPress={() => abrir(convenio)} accessibilityRole="button">
          <View style={estilos.fila}>
            <Text style={texto(15, { fontWeight: '700', marginRight: 8 })}>{convenio.codigo}</Text>
            <EtiquetaEstado texto={estado} variante={variante(estado)} />
          </View>
          <Text style={secundario(13)} numberOfLines={2}>{convenio.titulo}</Text>
        </TouchableOpacity>
      </View>

      {abierto && (
        <View style={[estilos.hijos, { borderLeftColor: colores.borde }]}>
          {!ficha && !error && <ActivityIndicator color={colores.acento} />}
          {error ? <Text style={{ color: colores.error }}>{error}</Text> : null}
          {ficha && (
            <>
              {rama('Convenio padre', (ficha.antecedentes ?? []).length === 0
                ? <Text style={secundario(13)}>No depende de otro convenio.</Text>
                : ficha.antecedentes.map((a) => (
                  <TouchableOpacity key={`a${a.id}`} onPress={() => abrir(a)}>
                    <Text style={texto(13, { color: colores.acento })}>↑ {a.codigo} · {a.titulo}</Text>
                  </TouchableOpacity>
                )))}
              {rama('Convenios hijos', (ficha.derivados ?? []).length === 0
                ? <Text style={secundario(13)}>No tiene específicos ni adendas.</Text>
                : ficha.derivados.map((d) => (
                  <TouchableOpacity key={`d${d.id}`} onPress={() => abrir(d)}>
                    <Text style={texto(13, { color: colores.acento })}>↳ {d.codigo} · {d.titulo}</Text>
                  </TouchableOpacity>
                )))}
              {rama('Resolución', <Text style={texto(13)}>{ficha.resolucion ? `Res. ${ficha.resolucion}` : 'Sin resolución cargada'}</Text>)}
              {rama('Documentación', (ficha.documentos ?? []).length === 0
                ? <Text style={secundario(13)}>Sin documentos.</Text>
                : ficha.documentos.map((doc) => (
                  <TouchableOpacity key={`doc${doc.id}`}
                    onPress={() => navigation.navigate('LeerPdf', { id: ficha.id, codigo: ficha.codigo, documento: doc, puedeFirmar: false })}>
                    <Text style={texto(13, { color: colores.acento })}>📄 {CATEGORIAS_DOCUMENTO[doc.categoria] ?? doc.categoria} · v{doc.numero_version}</Text>
                  </TouchableOpacity>
                )))}
            </>
          )}
        </View>
      )}
    </View>
  );
};

const estilos = StyleSheet.create({
  nodo: { borderWidth: 1, borderRadius: 16, padding: 12, marginBottom: 10 },
  fila: { flexDirection: 'row', alignItems: 'center' },
  flecha: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  hijos: { marginTop: 8, marginLeft: 15, paddingLeft: 12, borderLeftWidth: 2 },
  rama: { marginBottom: 8 },
});