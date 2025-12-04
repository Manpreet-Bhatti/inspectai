"use client";

import { useState } from "react";
import { User, Bell, Shield, Palette } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-foreground text-2xl font-bold tracking-tight">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Tabs */}
        <nav className="flex flex-row gap-1 lg:w-64 lg:flex-col">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1">
          <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
            {activeTab === "profile" && <ProfileSettings />}
            {activeTab === "notifications" && <NotificationSettings />}
            {activeTab === "security" && <SecuritySettings />}
            {activeTab === "appearance" && <AppearanceSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground text-lg font-semibold">Profile</h2>
        <p className="text-muted-foreground text-sm">
          Update your personal information.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-foreground block text-sm font-medium">
              First name
            </label>
            <input
              type="text"
              defaultValue="John"
              className="border-input bg-background text-foreground focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1"
            />
          </div>
          <div>
            <label className="text-foreground block text-sm font-medium">
              Last name
            </label>
            <input
              type="text"
              defaultValue="Inspector"
              className="border-input bg-background text-foreground focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1"
            />
          </div>
        </div>

        <div>
          <label className="text-foreground block text-sm font-medium">
            Email
          </label>
          <input
            type="email"
            defaultValue="john@example.com"
            className="border-input bg-background text-foreground focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1"
          />
        </div>

        <div>
          <label className="text-foreground block text-sm font-medium">
            Company
          </label>
          <input
            type="text"
            defaultValue="Inspect Corp"
            className="border-input bg-background text-foreground focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm">
          Save changes
        </button>
      </div>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground text-lg font-semibold">Notifications</h2>
        <p className="text-muted-foreground text-sm">
          Configure how you receive notifications.
        </p>
      </div>

      <div className="space-y-4">
        {[
          {
            label: "Inspection completed",
            description: "Get notified when an inspection analysis is complete",
          },
          {
            label: "New findings",
            description: "Receive alerts for new critical findings",
          },
          {
            label: "Report ready",
            description: "Get notified when a report is ready for download",
          },
          {
            label: "Weekly summary",
            description: "Receive a weekly summary of your inspection activity",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-start justify-between gap-4"
          >
            <div>
              <p className="text-foreground font-medium">{item.label}</p>
              <p className="text-muted-foreground text-sm">
                {item.description}
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" defaultChecked className="peer sr-only" />
              <div className="bg-muted peer-checked:bg-primary peer-focus:ring-primary/20 peer h-6 w-11 rounded-full after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-focus:ring-2" />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground text-lg font-semibold">Security</h2>
        <p className="text-muted-foreground text-sm">
          Manage your account security settings.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-foreground block text-sm font-medium">
            Current password
          </label>
          <input
            type="password"
            className="border-input bg-background text-foreground focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1"
          />
        </div>

        <div>
          <label className="text-foreground block text-sm font-medium">
            New password
          </label>
          <input
            type="password"
            className="border-input bg-background text-foreground focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1"
          />
        </div>

        <div>
          <label className="text-foreground block text-sm font-medium">
            Confirm new password
          </label>
          <input
            type="password"
            className="border-input bg-background text-foreground focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm">
          Update password
        </button>
      </div>
    </div>
  );
}

function AppearanceSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground text-lg font-semibold">Appearance</h2>
        <p className="text-muted-foreground text-sm">
          Customize the look and feel of the application.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-foreground block text-sm font-medium">
            Theme
          </label>
          <select className="border-input bg-background text-foreground focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1">
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div>
          <label className="text-foreground block text-sm font-medium">
            Accent color
          </label>
          <div className="mt-2 flex gap-2">
            {[
              "bg-blue-500",
              "bg-green-500",
              "bg-purple-500",
              "bg-orange-500",
              "bg-pink-500",
            ].map((color) => (
              <button
                key={color}
                className={`h-8 w-8 rounded-full ${color} ring-offset-background hover:ring-foreground focus:ring-primary ring-2 ring-offset-2`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
