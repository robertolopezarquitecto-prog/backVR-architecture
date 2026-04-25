export const SCENES = {
    'salon': {
        name: 'Salón Principal',
        url: 'https://storage.googleapis.com/backvr-architecture-storage/renders/mi_primer_render.png',
        portals: [
            { id: 'cocina', position: { x: 5, y: -1, z: -5 }, label: 'Ir a Cocina' }
        ]
    },
    'cocina': {
        name: 'Cocina Americana',
        url: 'https://storage.googleapis.com/backvr-architecture-storage/renders/cocina_test.png', // Este es un placeholder, el usuario deberá subirlo
        portals: [
            { id: 'salon', position: { x: -5, y: -1, z: 5 }, label: 'Volver al Salón' }
        ]
    }
};
