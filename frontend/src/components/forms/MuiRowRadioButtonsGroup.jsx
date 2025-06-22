import * as React from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

export default function MuiRowRadioButtonsGroup({ label, options, onChange }) {
    // console.log("MuiRowRadioButtonsGroup :: options :: ", options);
    // console.log("MuiRowRadioButtonsGroup :: label :: ", label);

  return (
    <FormControl>
      <FormLabel id="demo-row-radio-buttons-group-label">{label}</FormLabel>
      <RadioGroup
        onChange={onChange}
        row
        aria-labelledby="demo-row-radio-buttons-group-label"
        name="row-radio-buttons-group"
      >
        {options.map((option) => (
            <FormControlLabel value={option} control={<Radio />} label={option} />
        ))}
      </RadioGroup>
    </FormControl>
  );
}
