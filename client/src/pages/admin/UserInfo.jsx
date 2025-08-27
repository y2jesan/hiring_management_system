import {
    EnvelopeIcon,
    PencilIcon,
    ShieldCheckIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';

const UserInfo = () => {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data) => {
    if (data.newPassword && data.newPassword !== data.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const updateData = {
        name: data.name,
        email: data.email
      };

      if (data.newPassword) {
        updateData.currentPassword = data.currentPassword;
        updateData.newPassword = data.newPassword;
      }

      const response = await userService.updateProfile(updateData);
      
      // Update local auth state
      const updatedUser = { ...user, ...response.data.user };
      login({ user: updatedUser }, true); // Force update without re-authentication
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
      reset({
        name: updatedUser.name,
        email: updatedUser.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset({
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'Super Admin': 'Super Administrator',
      'HR': 'Human Resources',
      'Evaluator': 'Evaluator',
      'MD': 'Managing Director'
    };
    return roleNames[role] || role;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary-800">Profile Information</h1>
                      <p className="mt-1 text-sm text-gray-500 hidden lg:block">
              Manage your account settings and profile information
            </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-primary flex items-center"
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <div className="mx-auto h-24 w-24 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <UserCircleIcon className="h-12 w-12 text-primary-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">{user?.name}</h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <div className="mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
                  <ShieldCheckIcon className="h-4 w-4 mr-1" />
                  {getRoleDisplayName(user?.role)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {isEditing ? 'Edit Profile' : 'Profile Details'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      className={`input ${errors.name ? 'border-danger-500' : ''}`}
                      {...register('name', { required: 'Name is required' })}
                    />
                  ) : (
                    <p className="text-gray-900">{user?.name}</p>
                  )}
                  {errors.name && (
                    <p className="mt-1 text-sm text-danger-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      className={`input ${errors.email ? 'border-danger-500' : ''}`}
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                    />
                  ) : (
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <p className="text-gray-900">{user?.email}</p>
                    </div>
                  )}
                  {errors.email && (
                    <p className="mt-1 text-sm text-danger-600">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <div className="flex items-center">
                  <ShieldCheckIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <p className="text-gray-900">{getRoleDisplayName(user?.role)}</p>
                </div>
              </div>

              {isEditing && (
                <>
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Change Password (Optional)</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          className="input"
                          {...register('currentPassword')}
                          placeholder="Enter current password"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            className={`input ${errors.newPassword ? 'border-danger-500' : ''}`}
                            {...register('newPassword', {
                              minLength: {
                                value: 6,
                                message: 'Password must be at least 6 characters'
                              }
                            })}
                            placeholder="Enter new password"
                          />
                          {errors.newPassword && (
                            <p className="mt-1 text-sm text-danger-600">{errors.newPassword.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            className={`input ${errors.confirmPassword ? 'border-danger-500' : ''}`}
                            {...register('confirmPassword')}
                            placeholder="Confirm new password"
                          />
                          {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-danger-600">{errors.confirmPassword.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="btn btn-secondary"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
