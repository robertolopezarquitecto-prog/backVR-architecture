export const SCENES = {
    'salon': {
        name: 'Salón Principal',
        url: 'https://storage.googleapis.com/backvr-architecture-storage/renders/mi_primer_render.png',
        portals: [
            { id: 'cocina', position: { x: 5, y: -0.5, z: -5 }, label: 'Ir a Cocina' }
        ]
    },
    'cocina': {
        name: 'Cocina Americana',
        url: 'https://storage.googleapis.com/backvr-architecture-storage/renders/mi_primer_render-cocina.png',
        portals: [
            { id: 'salon', position: { x: -5, y: -0.5, z: 5 }, label: 'Volver al Salón' }
        ]
    }
};
