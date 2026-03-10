export interface DummyDiamond {
    id: string;
    certificateNumber: string;
    shape: string;
    carat: number;
    color: string;
    clarity: string;
    cut: string;
    polish: string;
    symmetry: string;
    fluorescence: string;
    measurements: string;
    price: number;
    status: string;
    businessName: string;
    title: string;
    description: string;
}

export const DUMMY_DIAMONDS: DummyDiamond[] = [
    {
        id: '1',
        certificateNumber: 'GIA-6574839201',
        shape: 'Round',
        carat: 2.14,
        color: 'D',
        clarity: 'IF',
        cut: 'Excellent',
        polish: 'Excellent',
        symmetry: 'Excellent',
        fluorescence: 'None',
        measurements: '8.34 x 8.38 x 5.12 mm',
        price: 48500,
        status: 'AVAILABLE',
        businessName: 'Lumière Diamonds',
        title: 'Étoile Solitaire',
        description: 'A breathtaking round brilliant of exceptional purity. Fully fluorescence-free with supreme cut grading.'
    },
    {
        id: '2',
        certificateNumber: 'IGI-9988776655',
        shape: 'Pear',
        carat: 1.87,
        color: 'E',
        clarity: 'VS1',
        cut: 'Very Good',
        polish: 'Excellent',
        symmetry: 'Very Good',
        fluorescence: 'Faint',
        measurements: '10.50 x 6.80 x 4.20 mm',
        price: 22800,
        status: 'AVAILABLE',
        businessName: 'Lumière Diamonds',
        title: 'Aurora Pear',
        description: 'A graceful pear with a long elegant silhouette. Ideal for pendant or east-west setting.'
    },
    {
        id: '3',
        certificateNumber: 'GIA-1122334455',
        shape: 'Cushion',
        carat: 3.02,
        color: 'F',
        clarity: 'VVS2',
        cut: 'Excellent',
        polish: 'Excellent',
        symmetry: 'Excellent',
        fluorescence: 'None',
        measurements: '8.50 x 8.20 x 5.60 mm',
        price: 61200,
        status: 'AVAILABLE',
        businessName: 'Lumière Diamonds',
        title: 'Céleste Cushion',
        description: 'A massive cushion cut with crushed-ice faceting, presenting an incredible spread.'
    },
    {
        id: '4',
        certificateNumber: 'HRD-5544332211',
        shape: 'Hex',
        carat: 1.20,
        color: 'G',
        clarity: 'SI1',
        cut: 'Good',
        polish: 'Very Good',
        symmetry: 'Good',
        fluorescence: 'Medium',
        measurements: '6.50 x 6.50 x 4.00 mm',
        price: 14200,
        status: 'AVAILABLE',
        businessName: 'StoneHaus',
        title: 'Forest Hex',
        description: 'A unique geometric step-cut hexagon, perfect for alternative bespoke rings.'
    },
    {
        id: '5',
        certificateNumber: 'GIA-8888888888',
        shape: 'Marquise',
        carat: 2.88,
        color: 'F',
        clarity: 'VS1',
        cut: 'Ideal',
        polish: 'Excellent',
        symmetry: 'Excellent',
        fluorescence: 'None',
        measurements: '14.20 x 7.10 x 4.40 mm',
        price: 44000,
        status: 'AVAILABLE',
        businessName: 'Royal Cut Co.',
        title: 'Imperial Marquise',
        description: 'A regal marquise with dramatic pointed tips and face-up size that belies its carat weight.'
    },
    {
        id: '6',
        certificateNumber: 'IGI-1231231234',
        shape: 'Emerald',
        carat: 1.50,
        color: 'E',
        clarity: 'VVS1',
        cut: 'Excellent',
        polish: 'Excellent',
        symmetry: 'Excellent',
        fluorescence: 'None',
        measurements: '7.50 x 5.50 x 3.80 mm',
        price: 18500,
        status: 'AVAILABLE',
        businessName: 'Royal Cut Co.',
        title: 'Hall of Mirrors',
        description: 'Classic step-cut emerald shape with mesmerizing clarity and perfect proportions.'
    }
];
