import React from 'react';
import { Dimensions, StyleProp, TextStyle } from 'react-native';
import RenderHTML, {
    HTMLContentModel,
    HTMLElementModel
} from 'react-native-render-html';

const { width } = Dimensions.get('window');

interface RenderHtmlProps {
    html: string;
    style?: StyleProp<TextStyle>;
}

export default function MyHTMLRenderer({ html, style }: RenderHtmlProps) {
    return (
        <RenderHTML
            contentWidth={width}
            source={{ html }}
            customHTMLElementModels={{
                font: HTMLElementModel.fromCustomModel({
                    tagName: 'font',
                    contentModel: HTMLContentModel.textual
                })
            }}
            tagsStyles={{
                font: { color: 'white' },
                b: { fontSize: 14, fontWeight: '800' },
                p: { fontSize: 12},
                h1: { fontSize: 28 },
                h2: { fontSize: 24 },
                h3: { fontSize: 20 },
                h4: { fontSize: 18, fontWeight: "500" },
                h5: { fontSize: 16, fontWeight: "500" },
                h6: { fontSize: 14 }
            }}
        />
    );
}
