//صفحة البحث التقريبي
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Stack, Typography, Box, Button, Autocomplete, IconButton, Tooltip } from '@mui/material';
import { amber } from '@mui/material/colors';
import { Delete, Edit, AddCircle, ExpandMore } from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';
import { Container, Card, CardContent, Grid, ToggleButton, ToggleButtonGroup } from '@mui/material';

import { useApi } from '../utils';
import { DangerMsg, NotificationMsg } from '../components/NotificationMsg';
import { filePaths } from '../utils/paths';
import { useReactToPrint } from 'react-to-print';
import _ from 'lodash';
// import titles
import { titles } from '../utils/title';
// ----------------------------------------------------------------------

export default function ApproximateSearch() {
  //  define api
  const api = useApi();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {titles.approximateSearch}
      </Typography>
    </Box>
  );
}
