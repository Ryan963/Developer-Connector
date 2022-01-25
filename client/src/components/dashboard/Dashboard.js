import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import Spinner from '../layout/Spinner';
import { getCurrentProfile } from '../../actions/profile';
import DashboardActions from './DashboardActions';
import Experience from './Experience';
import Education from './Education'
import { deleteAccount } from '../../actions/profile';

const Dashboard = ({ getCurrentProfile , profile: { profile, loading }, auth: {user}, deleteAccount }) => {
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
            <Experience experience={profile.experience}/>
            <Education education={profile.education} />
            <div className="my-2">
                <button onClick={() => deleteAccount()} className="btn btn-danger">
                    <i className="fas fa-user-minus">Delete my Account</i>
                </button>
            </div>
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
    deleteAccount: PropTypes.func.isRequired,
}
const mapStateToProps = state => ({
    profile: state.profile,
    auth: state.auth
})
export default connect(mapStateToProps, { getCurrentProfile, deleteAccount })(Dashboard)

