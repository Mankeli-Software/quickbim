export type Building = {
    id: string;
    name: string;
    address: string;
    floors: Floor[];
  };
  
export type Floor = {
    id: string;
    title: string;
};

export const getModelUrl = (floor: Floor) => {
  return `https://quickbimstorage.blob.core.windows.net/quickbimmodels/${floor.id}.gltf`;
}