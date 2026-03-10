import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { User } from "@/entities/User";
import { UploadFile } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Star, MapPin, Plus, X, Save, Loader2, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { createPageUrl } from "@/utils";
import ServiceSelector from "../components/ServiceSelector";
import { israeliCities } from "../components/citiesData";

const allAvailabilities = ["בקרים", "צהריים", "ערבים", "סופ\"ש", "כל השבוע"];

// רכיב השלמה אוטומטית לערים - גרסה מתוקנת
const CityAutocomplete = ({ value, onChange, disabled }) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [filteredCities, setFilteredCities] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Keep inputValue in sync with the parent's value prop
    setInputValue(value || "");
  }, [value]);

  const handleInputChange = (e) => {
    const term = e.target.value;
    setInputValue(term);
    // Immediately update parent's state, but it might be reverted on blur if not a valid city
    onChange(term); 

    if (term.trim()) {
      const filtered = israeliCities.filter(city =>
        city.startsWith(term.trim())
      ).slice(0, 8); // מגביל ל-8 תוצאות
      setFilteredCities(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      // Show a short, sorted list if the input is empty
      setFilteredCities(israeliCities.slice(0, 8).sort((a, b) => a.localeCompare(b, 'he'))); 
      setShowDropdown(true);
    }
    setSelectedIndex(-1); // Reset selected index on input change
  };

  const handleCitySelect = (city) => {
    onChange(city);
    setInputValue(city);
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || filteredCities.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredCities.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredCities.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) {
        handleCitySelect(filteredCities[selectedIndex]);
      } else {
        // If Enter is pressed without a selection, try to find an exact match from filtered results
        const exactMatch = filteredCities.find(c => c === inputValue);
        if(exactMatch) {
          handleCitySelect(exactMatch);
        } else if (israeliCities.includes(inputValue)) {
          // If the typed value is a valid city but not in filtered (e.g., beyond slice limit), accept it
          handleCitySelect(inputValue);
        }
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      // Enforce: if the entered value is not in the Israeli cities list,
      // revert to the original value or clear if original value was null/empty.
      if (!israeliCities.includes(inputValue)) {
        setInputValue(value || "");
        onChange(value || "");
      }
      setShowDropdown(false);
      setSelectedIndex(-1);
    }, 200); // Small delay to allow click events on dropdown items to register
  };

  const handleFocus = () => {
     if (inputValue.trim()) {
        setFilteredCities(israeliCities.filter(city => city.startsWith(inputValue.trim())).slice(0, 8));
     } else {
        // Show a short, sorted initial list when input is empty and focused
        setFilteredCities(israeliCities.slice(0, 8).sort((a, b) => a.localeCompare(b, 'he')));
     }
     setShowDropdown(true);
  }

  return (
    <div className="relative">
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        disabled={disabled}
        placeholder="התחילו להקליד שם עיר..."
        className="mt-1"
        autoComplete="off"
      />
      
      {showDropdown && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto"
        >
          {filteredCities.length > 0 ? filteredCities.map((city, index) => (
            <div
              key={city}
              className={`px-3 py-2 text-right cursor-pointer hover:bg-gray-100 ${
                index === selectedIndex ? 'bg-gray-100' : ''
              }`}
              onMouseDown={(e) => e.preventDefault()} // Prevent blur from closing before click
              onClick={() => handleCitySelect(city)}
            >
              {city}
            </div>
          )) : (
            <div className="px-3 py-2 text-right text-gray-500">לא נמצאו תוצאות</div>
          )}
        </div>
      )}
    </div>
  );
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [myRatings, setMyRatings] = useState([]);
  const [profileViews, setProfileViews] = useState(0);
  const [formData, setFormData] = useState({
    full_name: "",
    age: "",
    location: "",
    bio: "",
    phone: "",
    services_offered: [],
    services_wanted: [],
    interests: [],
    availability: [],
    facebook_url: "",
    instagram_url: "",
    max_distance: 20,
    profile_image: ""
  });
  const [newInterest, setNewInterest] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
        try {
            const userData = await User.me();
            loadProfile(userData);
        } catch (error) {
            // Redirect to Home page if not authenticated or error
            window.location.href = createPageUrl('Home');
        }
    };
    checkAuthAndLoad();
  }, []);

  const loadProfile = async (userData) => {
    setIsLoading(true);
    setUser(userData);
    setFormData({
        full_name: userData.full_name || "",
        age: userData.age || "",
        location: userData.location || "",
        bio: userData.bio || "",
        phone: userData.phone || "",
        services_offered: userData.services_offered || [],
        services_wanted: userData.services_wanted || [],
        interests: userData.interests || [],
        availability: userData.availability || [],
        facebook_url: userData.facebook_url || "",
        instagram_url: userData.instagram_url || "",
        max_distance: userData.max_distance || 20,
        profile_image: userData.profile_image || ""
    });

    // Load ratings
    try {
      const ratings = await base44.entities.Rating.filter({ rated_user_id: userData.id }, "-created_date");
      const ratingsWithUsers = await Promise.all(ratings.map(async (r) => {
        try {
          const ratingUsers = await base44.entities.User.filter({ id: r.rating_user_id });
          return { ...r, ratingUser: ratingUsers[0] };
        } catch { return r; }
      }));
      setMyRatings(ratingsWithUsers);
      setProfileViews(userData.profile_views || 0);
    } catch (e) {}

    setIsLoading(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsSaving(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({ ...prev, profile_image: file_url }));
      await User.updateMyUserData({ profile_image: file_url });
      const updatedUserData = await User.me();
      loadProfile(updatedUserData); 
    } catch (error) {
      console.error("Error uploading image:", error);
    }
    setIsSaving(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Get location if not present
      if (!formData.latitude || !formData.longitude) {
        try {
          const position = await new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject)
          );
          formData.latitude = position.coords.latitude;
          formData.longitude = position.coords.longitude;
        } catch (locationError) {
          console.log("Could not get location, saving without it.", locationError);
        }
      }
      
      // Ensure location is valid before saving
      if (formData.location && !israeliCities.includes(formData.location)) {
          alert("אנא בחרו עיר תקינה מרשימת הערים.");
          setIsSaving(false);
          return;
      }

      await User.updateMyUserData(formData);
      const updatedUserData = await User.me();
      loadProfile(updatedUserData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
    setIsSaving(false);
  };

  const addInterest = () => {
    if (newInterest.trim()) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest("");
    }
  };

  const removeInterest = (index) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index)
    }));
  };

  const handleAvailabilityChange = (value) => {
    setFormData(prev => {
      const currentAvail = [...prev.availability];
      if (currentAvail.includes(value)) {
        return { ...prev, availability: currentAvail.filter(item => item !== value) };
      } else {
        return { ...prev, availability: [...currentAvail, value] };
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-teal-500 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600">טוען פרופיל...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">הפרופיל שלי</h1>
          <Button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={isSaving}
            className={isEditing ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"}
          >
            {isSaving ? (
              "שומר..."
            ) : isEditing ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                שמור
              </>
            ) : (
              "ערוך פרופיל"
            )}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Profile Header */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-orange-200 to-teal-200 rounded-full flex items-center justify-center">
                    {formData.profile_image ? (
                      <img
                        src={formData.profile_image}
                        alt={formData.full_name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-gray-600">
                        {formData.full_name?.charAt(0) || "?"}
                      </span>
                    )}
                    {isSaving && <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full"><Loader2 className="w-6 h-6 text-white animate-spin"/></div>}
                  </div>
                  {isEditing && (
                    <Button
                      size="icon"
                      className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden"/>
                </div>

                <div className="flex-1">
                  <h2 className="text-xl font-bold">{user?.full_name}</h2>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mt-1">
                    {user?.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {user.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current text-yellow-500" />
                      <span className="font-semibold">{user?.rating > 0 ? Number(user.rating).toFixed(1) : "0.0"}</span>
                      <span className="text-gray-400">({myRatings.length} ביקורות)</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-500">
                      <Eye className="w-4 h-4" />
                      <span>{profileViews} צפיות</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>פרטים בסיסיים</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="full_name">שם מלא</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({...prev, full_name: e.target.value}))}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">גיל</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({...prev, age: parseInt(e.target.value)}))}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="location">אזור מגורים</Label>
                  <CityAutocomplete
                    value={formData.location}
                    onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">טלפון</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="bio">תיאור אישי</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({...prev, bio: e.target.value}))}
                  disabled={!isEditing}
                  className="mt-1"
                  rows={3}
                  placeholder="ספרו על עצמכם..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Services Offered */}
          {isEditing ? (
            <ServiceSelector
              selectedServices={formData.services_offered}
              onServicesChange={(services) => setFormData(prev => ({...prev, services_offered: services}))}
              title="שירותים שאני מציע"
              placeholder="חפשו שירות שאתם מציעים..."
              maxServices={15}
            />
          ) : (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>שירותים שאני מציע</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {formData.services_offered.map((service, index) => (
                    <Badge key={index} className="bg-orange-100 text-orange-700 border-orange-200">
                      {service}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Services Wanted */}
          {isEditing ? (
            <ServiceSelector
              selectedServices={formData.services_wanted}
              onServicesChange={(services) => setFormData(prev => ({...prev, services_wanted: services}))}
              title="שירותים שאני מחפש"
              placeholder="חפשו שירות שאתם מחפשים..."
              maxServices={15}
            />
          ) : (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>שירותים שאני מחפש</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {formData.services_wanted.map((service, index) => (
                    <Badge key={index} className="bg-teal-100 text-teal-700 border-teal-200">
                      {service}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Availability */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>זמינות</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {allAvailabilities.map(item => (
                  <div key={item} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={item}
                      checked={formData.availability.includes(item)}
                      onCheckedChange={() => handleAvailabilityChange(item)}
                      disabled={!isEditing}
                    />
                    <label htmlFor={item} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {item}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>רשתות חברתיות</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="facebook_url">פייסבוק</Label>
                <Input
                  id="facebook_url"
                  value={formData.facebook_url}
                  onChange={(e) => setFormData(prev => ({...prev, facebook_url: e.target.value}))}
                  disabled={!isEditing}
                  className="mt-1"
                  placeholder="https://facebook.com/yourprofile"
                />
              </div>
              <div>
                <Label htmlFor="instagram_url">אינסטגרם</Label>
                <Input
                  id="instagram_url"
                  value={formData.instagram_url}
                  onChange={(e) => setFormData(prev => ({...prev, instagram_url: e.target.value}))}
                  disabled={!isEditing}
                  className="mt-1"
                  placeholder="https://instagram.com/yourprofile"
                />
              </div>
            </CardContent>
          </Card>

          {/* Interests */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>תחומי עניין ותחביבים</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {formData.interests.map((interest, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 flex items-center gap-1">
                      {interest}
                      {isEditing && (
                        <button
                          onClick={() => removeInterest(index)}
                          className="hover:bg-blue-200 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  </motion.div>
                ))}
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="תחום עניין חדש..."
                    onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                  />
                  <Button onClick={addInterest} size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ratings & Reviews */}
          {!isEditing && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  ביקורות ({myRatings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {myRatings.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">אין עדיין ביקורות. לאחר עסקאות ברטר, משתמשים יוכלו לדרג אתכם.</p>
                ) : (
                  <div className="space-y-4">
                    {myRatings.map((r) => (
                      <div key={r.id} className="border-b pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 bg-gradient-to-r from-orange-200 to-teal-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                            {r.ratingUser?.full_name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{r.ratingUser?.full_name || "משתמש"}</p>
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} className={`w-3.5 h-3.5 ${s <= r.stars ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        {r.barter_description && <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs mb-1">{r.barter_description}</Badge>}
                        {r.comment && <p className="text-sm text-gray-700">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Settings */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>הגדרות</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="max_distance">טווח חיפוש מקסימלי (ק"מ)</Label>
                <Input
                  id="max_distance"
                  type="number"
                  value={formData.max_distance}
                  onChange={(e) => setFormData(prev => ({...prev, max_distance: parseInt(e.target.value)}))}
                  disabled={!isEditing}
                  className="mt-1 max-w-32"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}