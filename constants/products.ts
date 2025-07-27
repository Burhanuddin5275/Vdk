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
  }
  | { banner: string };


const PRODUCTS: Product[] = [
  { id: '1', name: 'Josh Fair', brand: 'Josh', Category: 'Condoms', img: require('../assets/images/joshFair.png'), img1: require('../assets/images/joshSalajeet.png'), img2: require('../assets/images/joshSalajeet.png'), pts: 29, rating: 5, price: 350 },
  { id: '2', name: 'Josh Salajeet', brand: 'Josh', Category: 'Condoms', img: require('../assets/images/joshSalajeet.png'), img1: require('../assets/images/joshFair.png'), img2: require('../assets/images/joshDelay1.png'), pts: 25, rating: 5, price: 420 },
  { id: '3', name: 'Josh Delay', brand: 'Josh', Category: 'Condoms', img: require('../assets/images/joshDelay1.png'), img1: require('../assets/images/joshDelay1.png'), img2: require('../assets/images/joshSalajeet.png'), pts: 29, rating: 5, price: 290 },
  { id: '4', name: 'Josh Chaunsa', brand: 'Josh', Category: 'Condoms', img: require('../assets/images/joshChaunsa.png'), img1: require('../assets/images/joshChaunsa.png'), img2: require('../assets/images/joshChaunsa.png'), pts: 25, rating: 5, price: 510 },
  { id: '5', name: 'Josh Strawberry', brand: 'Josh', Category: 'Condoms', img: require('../assets/images/joshStrawberry.png'), img1: require('../assets/images/joshStrawberry.png'), img2: require('../assets/images/joshStrawberry.png'), pts: 29, rating: 5, price: 600 },
  { id: '6', name: 'Lahori Tikka', brand: 'Josh', Category: 'Condoms', img: require('../assets/images/joshTikka.png'), img1: require('../assets/images/joshTikkaProduct.png'), img2: require('../assets/images/joshTikka3Product.png'), pts: 25, rating: 5, price: 800 },
  { id: '7', name: 'Ok Silk', brand: 'OK', Category: 'Condoms', img: require('../assets/images/okSilk.png'), img1: require('../assets/images/okSilk.png'), img2: require('../assets/images/okSilk.png'), pts: 29, rating: 5, price: 900 },
  { id: '8', name: 'Ok Grape', brand: 'OK', Category: 'Condoms', img: require('../assets/images/okGrape.png'), img1: require('../assets/images/okGrape.png'), img2: require('../assets/images/okGrape.png'), pts: 25, rating: 5, price: 750 },
  { id: '9', name: 'Ok Strawberry', brand: 'OK', Category: 'Condoms', img: require('../assets/images/okStrawberry.png'), img1: require('../assets/images/okStrawberry.png'), img2: require('../assets/images/okStrawberry.png'), pts: 29, rating: 5, price: 670 },
  { id: '10', name: 'Ok Dotted', brand: 'OK', Category: 'Condoms', img: require('../assets/images/okDotted.png'), img1: require('../assets/images/okDotted.png'), img2: require('../assets/images/okDotted.png'), pts: 25, rating: 5, price: 220 },
  { id: '11', name: 'Ok Delay', brand: 'OK', Category: 'Condoms', img: require('../assets/images/okDelay.png'), img1: require('../assets/images/okDelay.png'), img2: require('../assets/images/okDelay.png'), pts: 29, rating: 5, price: 990 },
  { id: '12', name: 'Josh Lube - Strawberry', brand: 'Josh', Category: 'Lubricants', pts: 29, img: require('../assets/images/strawberryGel.png'), img1: require('../assets/images/strawberryGel.png'), rating: 4.5, price: 350 },
  { id: '13', name: 'Josh Lube - Fantasy', brand: 'Josh', Category: 'Lubricants', pts: 25, img: require('../assets/images/fantasyGel.png'), img1: require('../assets/images/fantasyGel.png'), rating: 4.5, price: 420 },
  { id: '14', name: 'Hormonal Implants & Devices', brand: 'Vida', Category: 'Devices', img: require('../assets/images/medicine.png'), img1: require('../assets/images/medicine.png'), pts: 29, rating: 4.5, price: 500 },
  { id: '15', name: 'Non-Hormonal Devices', brand: 'Vida', Category: 'Devices', img: require('../assets/images/Devices.png'), img1: require('../assets/images/Devices.png'), pts: 29, rating: 4.5, price: 600 },
  { id: '16', name: 'Femjack', brand: 'Vida', Category: 'Medicines', img: require('../assets/images/Femjack.png'), img1: require('../assets/images/okDotted.png'), img2: require('../assets/images/okDotted.png'), pts: 25, rating: 5, price: 220 },
  { id: '17', name: 'Misotin', brand: 'Vida', Category: 'Medicines', img: require('../assets/images/Misotin.png'), img1: require('../assets/images/okDelay.png'), img2: require('../assets/images/okDelay.png'), pts: 29, rating: 5, price: 990 },
  { id: '18', name: 'S.T Mom', brand: 'Vida', Category: 'Medicines', pts: 29, img: require('../assets/images/Mom.png'), img1: require('../assets/images/strawberryGel.png'), rating: 4.5, price: 350 },
  { id: '19', name: 'Ismila-28F', brand: 'Vida', Category: 'Medicines', pts: 25, img: require('../assets/images/Ismila.png'), img1: require('../assets/images/fantasyGel.png'), rating: 4.5, price: 420 },
  { id: '20', name: 'E-Pills', brand: 'Vida', Category: 'Medicines', img: require('../assets/images/Pill.png'), img1: require('../assets/images/medicine.png'), pts: 29, rating: 4.5, price: 500 },
  { id: '21', name: 'Zevion', brand: 'Vida', Category: 'Medicines', img: require('../assets/images/Zevion.png'), img1: require('../assets/images/Devices.png'), pts: 29, rating: 4.5, price: 600 },
];
export { PRODUCTS };
export type { Product };
