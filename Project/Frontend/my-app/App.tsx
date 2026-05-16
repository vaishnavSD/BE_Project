import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import Home from './app/index';
import Login from './app/login';
import Rates from './app/rates';
import Request from './app/request';
import UserDashboard from './app/userDashboard';
import AdminDashboard from './app/adminDashboard';
import ScrapCollection from './app/scrapCollection';
import ViewRequests from './app/viewRequests';
import ViewCollections from './app/viewCollections';
import ScrapDetails from './app/scrapDetails';
import ManageAgents from './app/manageAgents';
import Reports from './app/reports';
import AgentSignup from './app/agentSignup';
import FactoryDashboard from './app/factoryDashboard';
import ManageFactory from './app/manageFactory';
import FactoryReview from './app/factoryReview';
import FactoryApproved from './app/factoryApproved';
import CallAgentDashboard from './app/callAgentDashboard';
import AddEmployee from './app/addEmployee';
import AvailableRequests from './app/availableRequests';
import PendingPickups from './app/pendingPickups';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    // @ts-ignore
    <NavigationContainer>
      {/* @ts-ignore */}
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1e9d47',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={Home} 
          options={{ title: 'ScrapWale', headerShown: false }}
        />
        <Stack.Screen 
          name="Login" 
          component={Login} 
          options={{ title: 'Login' }}
        />
        <Stack.Screen 
          name="Rates" 
          component={Rates} 
          options={{ title: 'Scrap Rates' }}
        />
        <Stack.Screen 
          name="Request" 
          component={Request} 
          options={{ title: 'Book Pickup' }}
        />
        <Stack.Screen 
          name="UserDashboard" 
          component={UserDashboard} 
          options={{ title: 'Dashboard' }}
        />
        <Stack.Screen 
          name="AdminDashboard" 
          component={AdminDashboard} 
          options={{ title: 'Admin Dashboard' }}
        />
        <Stack.Screen 
          name="ScrapCollection" 
          component={ScrapCollection} 
          options={{ title: 'Collect Scrap' }}
        />
        <Stack.Screen 
          name="ViewRequests" 
          component={ViewRequests} 
          options={{ title: 'View Requests' }}
        />
        <Stack.Screen 
          name="ViewCollections" 
          component={ViewCollections} 
          options={{ title: 'View Collections' }}
        />
        <Stack.Screen 
          name="ScrapDetails" 
          component={ScrapDetails} 
          options={{ title: 'Scrap Details' }}
        />
        <Stack.Screen 
          name="ManageAgents" 
          component={ManageAgents} 
          options={{ title: 'Manage Agents' }}
        />
        <Stack.Screen 
          name="Reports" 
          component={Reports} 
          options={{ title: 'Reports' }}
        />
        <Stack.Screen 
          name="AgentSignup" 
          component={AgentSignup} 
          options={{ title: 'Add Agent' }}
        />
        <Stack.Screen 
          name="FactoryDashboard" 
          component={FactoryDashboard} 
          options={{ title: 'Factory Dashboard' }}
        />
        <Stack.Screen 
          name="ManageFactory" 
          component={ManageFactory} 
          options={{ title: 'Manage Factory Staff' }}
        />
        <Stack.Screen 
          name="FactoryReview" 
          component={FactoryReview} 
          options={{ title: 'Review Collections' }}
        />
        <Stack.Screen 
          name="FactoryApproved" 
          component={FactoryApproved} 
          options={{ title: 'Collected Items' }}
        />
        <Stack.Screen 
          name="CallAgentDashboard" 
          component={CallAgentDashboard} 
          options={{ title: 'Call Agent Dashboard' }}
        />
        <Stack.Screen 
          name="AddEmployee" 
          component={AddEmployee} 
          options={{ title: 'Add Employee' }}
        />
        <Stack.Screen 
          name="AvailableRequests" 
          component={AvailableRequests} 
          options={{ title: 'Available Requests' }}
        />
        <Stack.Screen 
          name="PendingPickups" 
          component={PendingPickups} 
          options={{ title: 'Pending Pickups' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}