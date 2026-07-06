import React, { useState } from 'react';
import type { SaveSchedulerPayload, CreateSchedulesProps } from '../types';

const CreateSchedules = ({ onCreated }: CreateSchedulesProps) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [jobName, setJobName] = useState('Sales Performance');
  const [dateRange, setDateRange] = useState<{ from: string, to: string }>({ from: "", to: "" })
  const [scheduleType, setScheduleType] = useState<'interval' | 'daily'>('interval');
  const [intervalVal, setIntervalVal] = useState('30');
  const [dailyTime, setDailyTime] = useState('14:00');

  // Upload Destination
  const [uploadType, setUploadType] = useState<'aws' | 'sftp'>('aws');

  // AWS S3 Credentials
  const [awsRegion, setAwsRegion] = useState('us-east-1');
  const [awsAccessKey, setAwsAccessKey] = useState('');
  const [awsSecretKey, setAwsSecretKey] = useState('');

  // SFTP Credentials
  const [sftpHost, setSftpHost] = useState('');
  const [sftpPort, setSftpPort] = useState('22');
  const [sftpUsername, setSftpUsername] = useState('');
  const [sftpPassword, setSftpPassword] = useState('');
  const [sftpPath, setSftpPath] = useState('/uploads/reports');

  // Deployment stages
  const [deployState, setDeployState] = useState<'idle' | 'validating' | 'connecting' | 'registering' | 'success'>('idle');
  const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


  // Types are now imported from ../types.ts

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }

    setDeployState('validating');

    try {
      const payload: SaveSchedulerPayload = {
        data: {
          id: crypto.randomUUID(),
          name: jobName,
          type: scheduleType,
          time: scheduleType == "interval" ? intervalVal : dailyTime,
          date: {
            start: dateRange.from,
            end: dateRange.to
          },
        },
        uploadType: uploadType,
        credentials: uploadType == "aws" ? {
          region: awsRegion,
          accessKeyId: awsAccessKey,
          secretAccessKey: awsSecretKey
        } : {
          host: sftpHost,
          port: sftpPort,
          username: sftpUsername,
          password: sftpPassword,
          path: sftpPath,
        },
        status: 'active'
      };

      const saveData = await fetch(`${VITE_API_BASE_URL}/schedule/saveSchedulerConfig`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!saveData.ok) {
        throw new Error("Failed to save configuration");
      }
     await onCreated()

      // Simulate progressive deployment phases
      setTimeout(() => {
        setDeployState('connecting');
        setTimeout(() => {
          setDeployState('registering');
          setTimeout(() => {
            setDeployState('success');
            setTimeout(() => {
              setDeployState('idle');
              setStep(1);
              // Reset fields
              setJobName('Sales Performance');
              setAwsAccessKey('');
              setAwsSecretKey('');
              setSftpHost('');
              setSftpUsername('');
              setSftpPassword('');
            }, 2500);
          }, 1200);
        }, 1000);
      }, 800);
    } catch (error) {
      console.error('error::: Failed to deploy schedule:::', error);
      setDeployState('idle');
    }
  };

  return (
    <form onSubmit={handleDeploy} className="h-full w-full bg-white border border-slate-200/80 rounded-xl p-5 flex flex-col justify-between text-slate-900 shadow-sm overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto pr-1">
        {/* Heading */}
        <div className="pb-3.5 border-b border-slate-100 mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              Configure &amp; Deploy Service
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Spin up a new timed action daemon on the active node
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200/60">
            Step {step} of 2
          </span>
        </div>

        {/* Wizard Steps Navigation Bar */}
        <div className="flex items-center gap-2 mb-4 bg-slate-50 p-1.5 rounded-lg border border-slate-200/50">
          <button
            type="button"
            onClick={() => deployState === 'idle' && setStep(1)}
            disabled={deployState !== 'idle'}
            className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-md transition-all cursor-pointer ${step === 1
              ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80'
              : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            1. Trigger &amp; Target
          </button>
          <button
            type="button"
            onClick={() => deployState === 'idle' && setStep(2)}
            disabled={deployState !== 'idle'}
            className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-md transition-all cursor-pointer ${step === 2
              ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80'
              : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            2. Destination &amp; Auth
          </button>
        </div>

        {/* STEP 1: General Info & Trigger Details */}
        {step === 1 && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            {/* Job Name */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Job Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                  placeholder="e.g. Sales Report Syncer"
                  className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                  required
                />
                <div className="absolute left-2.5 top-2.5 text-slate-400">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Schedule Type Selector */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Schedule Type
              </label>
              <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setScheduleType('interval')}
                  className={`py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${scheduleType === 'interval'
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Interval
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleType('daily')}
                  className={`py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${scheduleType === 'daily'
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  Daily
                </button>
              </div>
            </div>

            {/* Interval input */}
            {scheduleType === 'interval' && (
              <div className="animate-slideDown">
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Interval Duration
                </label>
                <div className="relative flex rounded-lg border border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                  <input
                    type="number"
                    value={intervalVal}
                    onChange={(e) => setIntervalVal(e.target.value)}
                    min="1"
                    className="w-full bg-transparent px-3 py-2 text-xs font-medium text-slate-900 outline-none"
                    required
                  />
                  <span className="flex items-center px-3 text-[10px] font-bold text-slate-500 border-l border-slate-100 bg-slate-50 rounded-r-lg select-none">
                    minutes
                  </span>
                </div>
              </div>
            )}

            {/* Daily schedule time picker */}
            {scheduleType === 'daily' && (
              <div className="animate-slideDown">
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Daily Execution Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={dailyTime}
                    onChange={(e) => setDailyTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3.5 py-2 text-xs font-mono font-medium text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                    required
                  />
                  <div className="absolute left-2.5 top-2.5 text-slate-400">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Date Range */}
            <div className="animate-slideDown">
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Date Range
              </label>

              <div className="grid grid-cols-2 gap-3 mt-2">
                {/* From */}
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-500">
                    From
                  </label>

                  <div className="relative">
                    <input
                      type="date"
                      value={dateRange.from}
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          from: e.target.value
                        }))}
                      className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs font-medium text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />

                    <svg
                      className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>

                {/* To */}
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-500">
                    To
                  </label>

                  <div className="relative">
                    <input
                      type="date"
                      value={dateRange.to}
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          to: e.target.value
                        }))}
                      className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs font-medium text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />

                    <svg
                      className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Destination & Authentication Details */}
        {step === 2 && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            {/* Upload Type Selector */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Upload Type
              </label>
              <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setUploadType('aws')}
                  className={`py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${uploadType === 'aws'
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
                  </svg>
                  AWS S3
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType('sftp')}
                  className={`py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${uploadType === 'sftp'
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 13.5l3 3m0 0l3-3m-3 3v-6m1.06-4.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                  </svg>
                  SFTP
                </button>
              </div>
            </div>

            {/* AWS credentials fields */}
            {uploadType === 'aws' && (
              <div className="flex flex-col gap-3.5 animate-slideDown">
                {/* Region */}
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-500">
                    S3 Bucket Region
                  </label>
                  <input
                    type="text"
                    value={awsRegion}
                    onChange={(e) => setAwsRegion(e.target.value)}
                    placeholder="us-east-1"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                    required
                  />
                </div>

                {/* Access Key ID */}
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-500">
                    Access Key ID
                  </label>
                  <input
                    type="text"
                    value={awsAccessKey}
                    onChange={(e) => setAwsAccessKey(e.target.value)}
                    placeholder="AKIAIOSFODNN7EXAMPLE"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-medium text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                    required
                  />
                </div>

                {/* Secret Access Key */}
                <div>
                  <label className="mb-1 text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                    Secret Access Key
                    <span className="text-[10px] text-slate-400 font-normal flex items-center gap-0.5 select-none">
                      <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                      Encrypted
                    </span>
                  </label>
                  <input
                    type="password"
                    value={awsSecretKey}
                    onChange={(e) => setAwsSecretKey(e.target.value)}
                    placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-medium text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                    required
                  />
                </div>
              </div>
            )}

            {/* SFTP credentials fields */}
            {uploadType === 'sftp' && (
              <div className="flex flex-col gap-3 animate-slideDown">
                {/* Host and Port */}
                <div className="grid grid-cols-[3fr_1fr] gap-2">
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-slate-500">
                      SFTP Host
                    </label>
                    <input
                      type="text"
                      value={sftpHost}
                      onChange={(e) => setSftpHost(e.target.value)}
                      placeholder="sftp.company.com"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-slate-500">
                      Port
                    </label>
                    <input
                      type="number"
                      value={sftpPort}
                      onChange={(e) => setSftpPort(e.target.value)}
                      placeholder="22"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-500">
                    Username
                  </label>
                  <input
                    type="text"
                    value={sftpUsername}
                    onChange={(e) => setSftpUsername(e.target.value)}
                    placeholder="sftp_reports_user"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                    required
                  />
                </div>

                {/* Password / Key */}
                <div>
                  <label className="mb-1  text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                    Password / Private Key Pass
                    <span className="text-[10px] text-slate-400 font-normal flex items-center gap-0.5 select-none">
                      <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                      Encrypted
                    </span>
                  </label>
                  <input
                    type="password"
                    value={sftpPassword}
                    onChange={(e) => setSftpPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-medium text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                    required
                  />
                </div>

                {/* Target Remote Path */}
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-500">
                    Remote Path (Directory)
                  </label>
                  <input
                    type="text"
                    value={sftpPath}
                    onChange={(e) => setSftpPath(e.target.value)}
                    placeholder="/uploads/reports"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-medium text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                    required
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Button Row / Deploy Actions */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
        {/* Back Button (Only on step 2, disabled during deployment) */}
        {step === 2 && deployState === 'idle' && (
          <button
            type="button"
            onClick={() => setStep(1)}
            className="px-3 py-2 border border-slate-200 text-xs font-bold text-slate-600 bg-white rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-center gap-1 transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back
          </button>
        )}

        {/* Dynamic Action Button */}
        <button
          type="submit"
          disabled={deployState !== 'idle'}
          className={`flex-1 rounded-lg py-2 text-xs font-bold text-white transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${deployState === 'success'
            ? 'bg-emerald-600 hover:bg-emerald-700'
            : deployState !== 'idle'
              ? 'bg-blue-500/80 cursor-wait'
              : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/15 active:scale-[0.98]'
            }`}
        >
          {deployState === 'validating' && (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              VALIDATING MANIFEST...
            </>
          )}

          {deployState === 'connecting' && (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              CONNECTING TO WORKER...
            </>
          )}

          {deployState === 'registering' && (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              REGISTERING CRON RULE...
            </>
          )}

          {deployState === 'success' && (
            <>
              <svg className="h-3.5 w-3.5 text-white animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              DEPLOYED SUCCESSFULLY!
            </>
          )}

          {deployState === 'idle' && (
            <>
              {step === 1 ? (
                <>
                  Next: Destination Details
                  <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25" />
                  </svg>
                  Deploy to Cluster
                </>
              )}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default CreateSchedules;