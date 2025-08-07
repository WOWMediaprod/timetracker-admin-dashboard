import React from "react";
import { Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

export default function EfficiencyStatsTable({ stats }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Total Assigned</TableCell>
          <TableCell>On-Time</TableCell>
          <TableCell>Extensions</TableCell>
          <TableCell>Efficiency %</TableCell>
          <TableCell>Extension Rate %</TableCell>
          <TableCell>Adjusted Efficiency</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>{stats.totalAssigned}</TableCell>
          <TableCell>{stats.onTime}</TableCell>
          <TableCell>{stats.extensions}</TableCell>
          <TableCell>{stats.efficiency}</TableCell>
          <TableCell>{stats.extensionRate}</TableCell>
          <TableCell>{stats.adjustedEfficiency}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}