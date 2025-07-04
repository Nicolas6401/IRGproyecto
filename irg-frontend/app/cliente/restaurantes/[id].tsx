import { useLocalSearchParams, useRouter } from 'expo-router'
import { ScrollView, Text, StyleSheet, View } from 'react-native'
import Header from '../../../components/Header'
import Ranking from '../../../components/Ranking'
import Categorias from '../../../components/Categorias'
import { useRestaurantes } from '../../../contexts/RestoContext'
import { useState, useRef } from 'react'
import type { ScrollView as ScrollViewType } from 'react-native'
import MenuCardCliente from '../../../components/MenuCardCliente'

const ORDEN_CATEGORIAS = ['Entrantes', 'Primeros', 'Segundos', 'Postres', 'Bebidas']
const ORDEN_SUB = ['Frio', 'Caliente']

export default function RestauranteClientePage() {
    const { id } = useLocalSearchParams()
    const router = useRouter()
    const { restaurantes, votarPlato } = useRestaurantes()

    if (!id || !restaurantes[id as string]) {
        return (
            <View style={styles.wrapper}>
                <Text style={styles.sectionTitle}>Restaurante no encontrado</Text>
            </View>
        )
    }

    const restaurant = restaurantes[id as string]
    const categorias = ORDEN_CATEGORIAS.filter(cat =>
        restaurant.platos.some(p => p.category === cat)
    )

    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(categorias[0])
    const scrollRef = useRef<ScrollViewType>(null)
    const seccionesRef = useRef<Record<string, number>>({})

    const handleCategoriaPress = (cat: string) => {
        setCategoriaSeleccionada(cat)
        const y = seccionesRef.current[cat]
        if (scrollRef.current && y !== undefined) {
            scrollRef.current.scrollTo({ y: y - 80, animated: true })
        }
    }

    const guardarPosicion = (categoria: string, y: number) => {
        seccionesRef.current[categoria] = y
    }

    return (
        <View style={styles.wrapper}>
            <ScrollView
                ref={scrollRef}
                contentContainerStyle={styles.container}
                stickyHeaderIndices={[0, 3]}
                keyboardShouldPersistTaps="handled"
            >
                <Header />
                <Ranking topItems={restaurant.topItems} />
                <Text style={styles.sectionTitle}>~ Nuestra carta ~</Text>
                <View style={styles.stickyCategorias}>
                    <Categorias
                        categorias={categorias.map(cat => ({ principal: cat, secundaria: '' }))}
                        activa={categoriaSeleccionada}
                        setCategoria={handleCategoriaPress}
                    />
                </View>

                {categorias.map((cat, catIndex) => {
                    const subCats = ORDEN_SUB.filter(sub =>
                        restaurant.platos.some(p => p.category === cat && p.subCategory === sub)
                    )

                    return (
                        <View key={catIndex} onLayout={e => guardarPosicion(cat, e.nativeEvent.layout.y)}>
                            <Text style={styles.categoryTitle}>{cat}</Text>
                            {subCats.map((subCat, subIndex) => {
                                const platos = restaurant.platos.filter(
                                    p => p.category === cat && p.subCategory === subCat
                                )

                                return (
                                    <View key={`${cat}-${subCat}`}>
                                        <Text style={styles.subcategoryTitle}>{`${cat} - ${subCat}`}</Text>
                                        {platos.map((item, index) => {
                                            const globalIndex = restaurant.platos.findIndex(p => p.name === item.name)
                                            return (
                                                <MenuCardCliente
                                                    key={`${cat}-${subCat}-${index}`}
                                                    title={item.name}
                                                    description={item.description}
                                                    image={item.image}
                                                    index={globalIndex}
                                                    score={item.score}
                                                    category={cat}
                                                    subCategory={subCat}
                                                    onVote={(rating: number) =>
                                                        votarPlato(id as string, globalIndex, rating)
                                                    }
                                                />
                                            )
                                        })}
                                    </View>
                                )
                            })}
                            <View style={styles.separator} />
                        </View>
                    )
                })}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#f2ebdd',
    },
    container: {
        padding: 12,
        paddingTop: 0,
        paddingBottom: 90,
    },
    sectionTitle: {
        backgroundColor: '#6c1f2c',
        color: '#fff',
        padding: 8,
        marginVertical: 10,
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Playfair',
        textAlign: 'center',
    },
    stickyCategorias: {
        backgroundColor: '#f2ebdd',
        paddingTop: 12,
        paddingBottom: 0,
        zIndex: 10,
    },
    categoryTitle: {
        fontSize: 18,
        fontFamily: 'Playfair',
        color: '#6c1f2c',
        marginBottom: 8,
        marginTop: 12,
    },
    subcategoryTitle: {
        fontSize: 16,
        fontFamily: 'Playfair',
        color: '#333',
        marginBottom: 6,
        marginTop: 10,
        paddingLeft: 6,
    },
    separator: {
        height: 1,
        backgroundColor: '#6c1f2c',
        marginVertical: 16,
    },
})