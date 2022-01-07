import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import Spinner from '../layout/Spinner';
import { getCurrentProfile } from '../../actions/profile';
import DashboardActions from './DashboardActions';

const Dashboard = ({ getCurrentProfile , profile: { profile, loading }, auth: {user} }) => {
    useEffect(() => {
        getCurrentProfile();
        
    },[])
    return loading && profile === null ? <Spinner /> : (
        <section className='container'>
            <h1 className="large text-primary">Dashboard</h1>
            <p className="lead">
                <i className="fas fa-user">Welcome {user && user.name }</i>
            </p>{profile !== null ?(
            <>
            <DashboardActions />
            </>
             ) : (
            <>
            <p>You have not yet set up a profile, please add some info</p>
            <Link to="/create-profile" className='btn btn-primary my-1'>Create Profile</Link>
            </>
             )}
        </section>
    )
}

Dashboard.propTypes = {
    getCurrentProfile: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    profile: PropTypes.object.isRequired,
}
const mapStateToProps = state => ({
    profile: state.profile,
    auth: state.auth
})
export default connect(mapStateToProps, { getCurrentProfile })(Dashboard)

