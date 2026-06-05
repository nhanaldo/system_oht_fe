'use client';

import React from "react";
import JobsTable from "../../components/JobsTable";

export default function JobsContent() {
    return (
        <div>
            <JobsTable jobType="IMPORT" />
        </div>
    );
}