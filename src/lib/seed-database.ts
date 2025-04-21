import { addMuseumData } from './firebase';
import museumsData from '../../data.json';

/**
 * Imports all museum data from data.json to Firebase
 * This function can be called from a dashboard or admin page
 */
export const importAllMuseumsData = async () => {
  console.log('Starting import of museums data to Firebase...');
  
  try {
    const results = await Promise.all(
      museumsData.map(async (museum) => {
        const result = await addMuseumData(museum);
        return {
          id: museum.id,
          name: museum.name,
          success: result.success
        };
      })
    );
    
    console.log('Import complete:', results);
    
    // Count successes and failures
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    
    return {
      success: true,
      message: `Import complete. ${successful} museums added successfully, ${failed} failed.`,
      details: results
    };
  } catch (error) {
    console.error('Error importing museums data:', error);
    return {
      success: false,
      message: 'Failed to import museums data',
      error
    };
  }
};

/**
 * Import a single museum by ID
 */
export const importMuseumById = async (id: string) => {
  try {
    const museum = museumsData.find(m => m.id === id);
    
    if (!museum) {
      return {
        success: false,
        message: `Museum with ID ${id} not found in data.json`
      };
    }
    
    const result = await addMuseumData(museum);
    
    return {
      success: result.success,
      message: result.success 
        ? `Museum ${museum.name} imported successfully` 
        : `Failed to import museum ${museum.name}`,
      data: museum
    };
  } catch (error) {
    console.error(`Error importing museum ${id}:`, error);
    return {
      success: false,
      message: `Failed to import museum with ID ${id}`,
      error
    };
  }
}; 