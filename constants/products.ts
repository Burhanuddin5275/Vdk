type Product =
  | {
    id: string;
    name: string;
    brand: string;
    Category: string;
    img: any;
    img1: any;
    img2?: any;
    img3?: any;
    img4?: any;
    img5?: any;
    pts: number;
    rating: number;
    price: number;
    description?: string;
    ingredients?: string[];
  }
  | { banner: string };


const PRODUCTS: Product[] = [
  { id: '1', name: 'Josh Fair', brand: 'Josh', Category: 'Condoms', img: require('../assets/images/joshFair.png'), img1: require('../assets/images/joshSalajeet.png'), img2: require('../assets/images/joshSalajeet.png'), pts: 29, rating: 5, price: 350, description: 'Josh Fair is a premium condom designed for comfort and safety.', ingredients: ['Latex', 'Lubricant'] },
  { id: '2', name: 'Josh Salajeet', brand: 'Josh', Category: 'Condoms', img: require('../assets/images/joshSalajeet.png'), img1: require('../assets/images/joshFair.png'), img2: require('../assets/images/joshDelay1.png'), pts: 25, rating: 5, price: 420, description: 'Josh Salajeet offers enhanced pleasure and protection.', ingredients: ['Latex', 'Salajeet Essence'] },
  { id: '3', name: 'Josh Delay', brand: 'Josh', Category: 'Condoms', img: require('../assets/images/joshDelay1.png'), img1: require('../assets/images/joshDelay1.png'), img2: require('../assets/images/joshSalajeet.png'), pts: 29, rating: 5, price: 290, description: 'Josh Delay helps prolong your intimate moments.', ingredients: ['Latex', 'Benzocaine'] },
  { id: '4', name: 'Josh Chaunsa', brand: 'Josh', Category: 'Condoms', img: require('../assets/images/joshChaunsa.png'), img1: require('../assets/images/joshChaunsa.png'), img2: require('../assets/images/joshChaunsa.png'), pts: 25, rating: 5, price: 510, description: 'Josh Chaunsa is a unique condom with a stimulating sensation.', ingredients: ['Latex', 'Chameli Oil'] },
  { id: '5', name: 'Josh Strawberry', brand: 'Josh', Category: 'Condoms', img: require('../assets/images/joshStrawberry.png'), img1: require('../assets/images/joshStrawberry.png'), img2: require('../assets/images/joshStrawberry.png'), pts: 29, rating: 5, price: 600, description: 'Josh Strawberry is a natural condom with a sweet flavor.', ingredients: ['Latex', 'Strawberry Extract'] },
  { id: '6', name: 'Lahori Tikka', brand: 'Josh', Category: 'Condoms', img: require('../assets/images/joshTikka.png'), img1: require('../assets/images/joshTikkaProduct.png'), img2: require('../assets/images/joshTikka3Product.png'), pts: 25, rating: 5, price: 800, description: 'Lahori Tikka is a premium condom with a unique design.', ingredients: ['Latex', 'Tikka Essence'] },
  { id: '7', name: 'Ok Silk', brand: 'OK', Category: 'Condoms', img: require('../assets/images/okSilk.png'), img1: require('../assets/images/okSilk.png'), img2: require('../assets/images/okSilk.png'), pts: 29, rating: 5, price: 900, description: 'Ok Silk is a smooth condom for a comfortable fit.', ingredients: ['Latex', 'Silk'] },
  { id: '8', name: 'Ok Grape', brand: 'OK', Category: 'Condoms', img: require('../assets/images/okGrape.png'), img1: require('../assets/images/okGrape.png'), img2: require('../assets/images/okGrape.png'), pts: 25, rating: 5, price: 750, description: 'Ok Grape is a fruity condom with a natural flavor.', ingredients: ['Latex', 'Grape Extract'] },
  { id: '9', name: 'Ok Strawberry', brand: 'OK', Category: 'Condoms', img: require('../assets/images/okStrawberry.png'), img1: require('../assets/images/okStrawberry.png'), img2: require('../assets/images/okStrawberry.png'), pts: 29, rating: 5, price: 670, description: 'Ok Strawberry is a sweet condom with a natural taste.', ingredients: ['Latex', 'Strawberry Extract'] },
  { id: '10', name: 'Ok Dotted', brand: 'OK', Category: 'Condoms', img: require('../assets/images/okDotted.png'), img1: require('../assets/images/okDotted.png'), img2: require('../assets/images/okDotted.png'), pts: 25, rating: 5, price: 220, description: 'Ok Dotted is a textured condom for enhanced pleasure.', ingredients: ['Latex', 'Dotted Texture'] },
  { id: '11', name: 'Ok Delay', brand: 'OK', Category: 'Condoms', img: require('../assets/images/okDelay.png'), img1: require('../assets/images/okDelay.png'), img2: require('../assets/images/okDelay.png'), pts: 29, rating: 5, price: 990, description: 'Ok Delay is a condom with a built-in lubricant for longer lasting pleasure.', ingredients: ['Latex', 'Lubricant'] },
  { id: '12', name: 'Josh Lube - Strawberry', brand: 'Josh', Category: 'Lubricants', pts: 29, img: require('../assets/images/strawberryGel.png'), img1: require('../assets/images/strawberryGel.png'), rating: 4.5, price: 350, description: 'Josh Lube - Strawberry is a natural lubricant for enhanced pleasure.', ingredients: ['Water', 'Glycerin', 'Sorbitol'] },
  { id: '13', name: 'Josh Lube - Fantasy', brand: 'Josh', Category: 'Lubricants', pts: 25, img: require('../assets/images/fantasyGel.png'), img1: require('../assets/images/fantasyGel.png'), rating: 4.5, price: 420, description: 'Josh Lube - Fantasy is a luxurious lubricant for a premium experience.', ingredients: ['Water', 'Glycerin', 'Sorbitol'] },
  { id: '14', name: 'Hormonal Implants & Devices', brand: 'Vidafem', Category: 'Devices', img: require('../assets/images/medicine.png'), img1: require('../assets/images/medicine.png'), pts: 29, rating: 4.5, price: 500, description: 'Hormonal Implants & Devices are medical devices for hormonal contraception.', ingredients: ['Hormones', 'Medical Materials'] },
  { id: '15', name: 'Non-Hormonal Devices', brand: 'Vidafem', Category: 'Devices', img: require('../assets/images/Devices.png'), img1: require('../assets/images/Devices.png'), pts: 29, rating: 4.5, price: 600, description: 'Non-Hormonal Devices are medical devices for contraception without hormones.', ingredients: ['Medical Materials'] },
  { id: '16', name: 'Femjack', brand: 'Vidafem', Category: 'Medicines', img: require('../assets/images/Femjack.png'), img1: require('../assets/images/okDotted.png'), img2: require('../assets/images/okDotted.png'), pts: 25, rating: 5, price: 220, description: 'Femjack is a contraceptive pill for women.', ingredients: ['Progestin', 'Estrogen'] },
  { id: '17', name: 'Misotin', brand: 'Vidafem', Category: 'Medicines', img: require('../assets/images/Misotin.png'), img1: require('../assets/images/okDelay.png'), img2: require('../assets/images/okDelay.png'), pts: 29, rating: 5, price: 990, description: 'Misotin is a contraceptive pill for women.', ingredients: ['Progestin', 'Estrogen'] },
  { id: '18', name: 'S.T Mom', brand: 'Vidafem', Category: 'Medicines', pts: 29, img: require('../assets/images/Mom.png'), img1: require('../assets/images/strawberryGel.png'), rating: 4.5, price: 350, description: 'S.T Mom is a contraceptive pill for women.', ingredients: ['Progestin', 'Estrogen'] },
  { id: '19', name: 'Ismila-28F', brand: 'Vidafem', Category: 'Medicines', pts: 25, img: require('../assets/images/Ismila.png'), img1: require('../assets/images/fantasyGel.png'), rating: 4.5, price: 420, description: 'Ismila-28F is a contraceptive pill for women.', ingredients: ['Progestin', 'Estrogen'] },
  { id: '20', name: 'E-Pills', brand: 'Vidafem', Category: 'Medicines', img: require('../assets/images/Pill.png'), img1: require('../assets/images/medicine.png'), pts: 29, rating: 4.5, price: 500, description: 'E-Pills are contraceptive pills for women.', ingredients: ['Progestin', 'Estrogen'] },
  { id: '21', name: 'Zevion', brand: 'Vidafem', Category: 'Medicines', img: require('../assets/images/Zevion.png'), img1: require('../assets/images/Devices.png'), pts: 29, rating: 4.5, price: 600, description: 'Zevion is a contraceptive pill for women.', ingredients: ['Progestin', 'Estrogen'] },
];
export { PRODUCTS };
export type { Product };

