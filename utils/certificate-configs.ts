import { Heart, Pill, Handshake, Bug, Cross, Shield, Syringe } from "lucide-react";
import React from "react";

export interface CertificateConfig {
  name: string; // e.g., "Fitness Travel Certificate"
  description?: string; // Optional description shown in the UI
  icon: React.ElementType; // e.g., Heart from lucide-react
  title: string; // e.g., "FITNESS CERTIFICATE FOR TRAVELLING"
  certificationText: string; // The main descriptive text
  initialPetDescription: string; // Default text for pet description
  toastMessages: {
    saved: string;
    updated: string;
    failedToSave: string;
    printed: string;
    failedToPrint: string;
    downloaded: string;
    failedToDownload: string;
  };
}

export const certificateConfigs: CertificateConfig[] = [
  {
    name: "Fitness Travel Certificate",
    icon: Heart,
    title: "FITNESS CERTIFICATE FOR TRAVELLING",
    certificationText: "This is to certify that I have personally examined the below mentioned pet {getPatientDisplayName()} and found that the pet is fit for travel and meets all transportation requirements. The pet has been thoroughly examined and is free from any contagious diseases or health conditions that would prevent safe travel.",
    initialPetDescription: "The pet is completely healthy & fully vaccinated",
    toastMessages: {
      saved: "Fitness Travel Certificate saved successfully.",
      updated: "Fitness Travel Certificate updated successfully.",
      failedToSave: "Failed to save fitness travel certificate",
      printed: "Fitness Travel Certificate printed successfully",
      failedToPrint: "Failed to print fitness travel certificate",
      downloaded: "Fitness Travel Certificate downloaded successfully",
      failedToDownload: "Failed to download fitness travel certificate",
    },
  },
  {
    name: "Deworming Certificate",
    icon: Pill,
    title: "DEWORMING CERTIFICATE",
    certificationText: "This is to certify that I have personally administered deworming treatment to the below mentioned pet {getPatientDisplayName()} and documented all parasite control measures. The pet has received appropriate deworming medication as per veterinary standards and protocols.",
    initialPetDescription: "The pet is completely healthy & fully vaccinated",
    toastMessages: {
      saved: "Deworming Certificate saved successfully.",
      updated: "Deworming Certificate updated successfully.",
      failedToSave: "Failed to save deworming certificate",
      printed: "Deworming Certificate printed successfully",
      failedToPrint: "Failed to print deworming certificate",
      downloaded: "Deworming Certificate downloaded successfully",
      failedToDownload: "Failed to download deworming certificate",
    },
  },
  {
    name: "Euthanasia Certificate",
    icon: Cross,
    title: "EUTHANASIA CERTIFICATE",
    certificationText: "This is to certify that I have personally performed humane euthanasia on the below mentioned pet {getPatientDisplayName()} in accordance with veterinary standards and protocols. The procedure was conducted with the utmost care and compassion, ensuring the pet's comfort and dignity throughout the process.",
    initialPetDescription: "The pet was treated with dignity and compassion throughout the process",
    toastMessages: {
      saved: "Euthanasia Certificate saved successfully.",
      updated: "Euthanasia Certificate updated successfully.",
      failedToSave: "Failed to save euthanasia certificate",
      printed: "Euthanasia Certificate printed successfully",
      failedToPrint: "Failed to print euthanasia certificate",
      downloaded: "Euthanasia Certificate downloaded successfully",
      failedToDownload: "Failed to download euthanasia certificate",
    },
  },
  {
    name: "Tick Medicine Certificate",
    description: "Documentation of tick prevention and treatment",
    icon: Bug,
    title: "TICK MEDICINE CERTIFICATE",
    certificationText: "This is to certify that I have personally administered tick prevention and treatment medication to the below mentioned pet {getPatientDisplayName()} and documented all tick control protocols. The pet has received appropriate tick prevention medication as per veterinary standards and protocols.",
    initialPetDescription: "The pet is completely healthy & fully vaccinated",
    toastMessages: {
      saved: "Tick Medicine Certificate saved successfully.",
      updated: "Tick Medicine Certificate updated successfully.",
      failedToSave: "Failed to save tick medicine certificate",
      printed: "Tick Medicine Certificate printed successfully",
      failedToPrint: "Failed to print tick medicine certificate",
      downloaded: "Tick Medicine Certificate downloaded successfully",
      failedToDownload: "Failed to download tick medicine certificate",
    },
  },
  {
    name: "Health Hostel Certificate",
    description: "Health certification for pet boarding facilities",
    icon: Shield,
    title: "HEALTH CERTIFICATE FOR HOSTEL",
    certificationText: "This is to certify that I have personally examined the below mentioned pet {getPatientDisplayName()} and found that the pet is healthy and suitable for boarding facilities. The pet has been thoroughly examined and is free from any contagious diseases or health conditions that would pose a risk to other animals in the facility.",
    initialPetDescription: "The pet is completely healthy & fully vaccinated",
    toastMessages: {
      saved: "Health Hostel Certificate saved successfully.",
      updated: "Health Hostel Certificate updated successfully.",
      failedToSave: "Failed to save health hostel certificate",
      printed: "Health Hostel Certificate printed successfully",
      failedToPrint: "Failed to print health hostel certificate",
      downloaded: "Health Hostel Certificate downloaded successfully",
      failedToDownload: "Failed to download health hostel certificate",
    },
  },
  {
    name: "Vaccination Certificate",
    description: "Official record of pet vaccinations and immunizations",
    icon: Syringe,
    title: "VACCINATION CERTIFICATE",
    certificationText: "This is to certify that I have personally administered vaccinations to the below mentioned pet {getPatientDisplayName()} and documented all immunization records. The pet has received all necessary vaccinations as per veterinary standards and protocols.",
    initialPetDescription: "The pet is completely healthy & fully vaccinated",
    toastMessages: {
      saved: "Vaccination Certificate saved successfully.",
      updated: "Vaccination Certificate updated successfully.",
      failedToSave: "Failed to save vaccination certificate",
      printed: "Vaccination Certificate printed successfully",
      failedToPrint: "Failed to print vaccination certificate",
      downloaded: "Vaccination Certificate downloaded successfully",
      failedToDownload: "Failed to download vaccination certificate",
    },
  },
  {
    name: "Consent Bond Certificate",
    description: "Documentation of owner consent for veterinary procedures",
    icon: Handshake,
    title: "CONSENT BOND CERTIFICATE",
    certificationText: "This is to certify that I have obtained proper legal consent from the owner {getOwnerDisplayName()} for veterinary procedures performed on the below mentioned pet {getPatientDisplayName()}. All necessary consent documentation has been completed and signed in accordance with veterinary legal requirements and standards.",
    initialPetDescription: "All treatment options have been discussed with the pet owner and informed consent has been obtained",
    toastMessages: {
      saved: "Consent Bond Certificate saved successfully.",
      updated: "Consent Bond Certificate updated successfully.",
      failedToSave: "Failed to save consent bond certificate",
      printed: "Consent Bond Certificate printed successfully",
      failedToPrint: "Failed to print consent bond certificate",
      downloaded: "Consent Bond Certificate downloaded successfully",
      failedToDownload: "Failed to download consent bond certificate",
    },
  },
];

