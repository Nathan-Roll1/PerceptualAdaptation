// DataPipe Adapter: Custom implementation for non-jsPsych experiments
// This adapter allows sending data to DataPipe without requiring full jsPsych integration

const DataPipeAdapter = {
  // Initialize the adapter with the experiment ID
  init: function(experimentId) {
    this.experimentId = experimentId;
    this.apiUrl = 'https://pipe.jspsych.org/api/data/';
    console.log('DataPipeAdapter initialized with experiment ID:', experimentId);
    return this;
  },

  // Save data to DataPipe
  saveData: function(filename, dataString, onSuccess, onError) {
    // Create the data to send
    const formData = new FormData();
    
    // Add standard DataPipe fields
    formData.append('experiment_id', this.experimentId);
    formData.append('filename', filename);
    formData.append('data_string', dataString);
    
    // Log what we're sending (for debugging)
    console.log('Sending data to DataPipe:', {
      url: this.apiUrl,
      experimentId: this.experimentId,
      filename: filename,
      dataSize: dataString.length
    });

    // Send the data using fetch API
    fetch(this.apiUrl, {
      method: 'POST',
      body: formData,
      mode: 'cors'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`DataPipe API error: ${response.status}`);
      }
      return response.json();
    })
    .then(result => {
      console.log('DataPipe save successful:', result);
      if (onSuccess) onSuccess(result);
    })
    .catch(error => {
      console.error('Error sending data to DataPipe:', error);
      if (onError) onError(error);
    });
  },

  // Format experiment data as CSV
  formatDataAsCSV: function(experimentData) {
    // Extract responses for formatting
    const responses = experimentData.responses || [];
    
    // If no responses, return empty string
    if (responses.length === 0) {
      return '';
    }
    
    // Get headers from the first response (assuming all responses have the same structure)
    const sampleResponse = this.formatResponseForCSV(responses[0], experimentData);
    const headers = Object.keys(sampleResponse);
    
    // Create CSV header row
    let csvContent = headers.join(',') + '\n';
    
    // Add each response as a row
    responses.forEach(response => {
      const formattedResponse = this.formatResponseForCSV(response, experimentData);
      
      // Create the CSV row by mapping each header to its value
      const row = headers.map(header => {
        const value = formattedResponse[header] || '';
        
        // Escape quotes and wrap with quotes if contains comma or quotes
        const needsQuotes = /[",\n\r]/.test(value);
        const escaped = String(value).replace(/"/g, '""');
        return needsQuotes ? `"${escaped}"` : escaped;
      }).join(',');
      
      csvContent += row + '\n';
    });
    
    return csvContent;
  },
  
  // Format individual response for CSV
  formatResponseForCSV: function(response, experimentData) {
    return {
      participant_id: experimentData.participantId || response.participantId,
      condition: experimentData.condition || response.condition,
      trial_number: response.trial,
      stimulus: response.stimulus,
      response: response.response,
      audio_played_successfully: response.audioPlayedSuccessfully ? 'true' : 'false',
      start_time: response.startTime,
      end_time: response.endTime,
      experiment_start_time: experimentData.startTime,
      experiment_end_time: experimentData.completionTime || new Date().toISOString()
    };
  }
};