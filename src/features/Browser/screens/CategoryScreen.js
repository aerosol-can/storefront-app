import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, TouchableOpacity, Text, Image, ActivityIndicator } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import useStorefront, { adapter as StorefrontAdapter } from 'hooks/use-storefront';
import { useMountedState, useLocale } from 'hooks';
import { formatCurrency, logError, config, translate, isLastIndex } from 'utils';
import { useResourceCollection } from 'utils/Storage';
import Storefront, { Category } from '@fleetbase/storefront';
import ProductCard from 'ui/ProductCard';
import tailwind from 'tailwind';

const CategoryScreen = ({ navigation, route }) => {
    const { attributes } = route.params;

    const category = new Category(attributes, StorefrontAdapter);
    const isMounted = useMountedState();
    const storefront = useStorefront();
    const [locale] = useLocale();

    const [subCategories, setSubCategories] = useResourceCollection('category', Category, StorefrontAdapter);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const stopLoading = () => setIsLoading(false);

    const transitionToCategory = (category) => {
        navigation.navigate('CategoryScreen', { attributes: category.serialize() });
    };

    useEffect(() => {
        // load products for category
        storefront.products.query({ category: category.id }).then(setProducts).catch(logError).finally(stopLoading);

        // load sub categories
        storefront.categories.query({ parent: category.id }).then(setSubCategories).catch(logError).finally(stopLoading);
    }, [isMounted]);

    return (
        <SafeAreaView style={tailwind('bg-white')}>
            <View style={tailwind('bg-white h-full w-full p-4')}>
                <View style={tailwind('flex flex-row items-center mb-6')}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={tailwind('mr-4')}>
                        <View style={tailwind('rounded-full bg-gray-100 w-10 h-10 flex items-center justify-center')}>
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </View>
                    </TouchableOpacity>
                    <Text style={tailwind('text-xl font-semibold')}>{category.getAttribute('name')}</Text>
                    {isLoading && (
                        <View style={tailwind('ml-4')}>
                            <ActivityIndicator />
                        </View>
                    )}
                </View>
                <ScrollView showsVerticalScrollIndicator={false} style={tailwind('flex flex-row')}>
                    <View style={[tailwind('')]}>
                        <View style={tailwind('flex')}>
                            {subCategories.map((category, index) => (
                                <TouchableOpacity
                                    key={category.id}
                                    onPress={() => transitionToCategory(category)}
                                    style={[tailwind(`w-full flex flex-row items-center py-3 px-2 ${isLastIndex(subCategories, index) ? '' : 'border-b border-gray-100'}`)]}
                                >
                                    <View style={[tailwind('flex flex-row items-center justify-center mr-3')]}>
                                        <View style={[tailwind('rounded-full flex items-center justify-center w-8 h-8 bg-blue-50')]}>
                                            <FontAwesomeIcon icon={faFolder} size={17} style={[tailwind('text-blue-900')]} />
                                        </View>
                                    </View>
                                    <Text style={[tailwind('font-semibold')]} numberOfLines={1}>
                                        {translate(category, 'name')}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    <View style={[tailwind('py-2')]}>
                        {products.map((product, index) => (
                            <ProductCard
                                key={index}
                                product={product}
                                containerStyle={tailwind('w-1/2')}
                                onPress={() => navigation.navigate('ProductScreen', { attributes: product.serialize() })}
                            />
                        ))}
                    </View>
                    <View style={tailwind('h-44 w-full')} />
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default CategoryScreen;
