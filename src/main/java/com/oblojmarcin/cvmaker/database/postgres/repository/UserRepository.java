package com.oblojmarcin.cvmaker.database.postgres.repository;



import com.oblojmarcin.cvmaker.database.postgres.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmail(@Param("email") String email);

    Optional<User> findByVerificationToken(String token);
    Optional<User> findByResetPasswordToken(String resetPasswordToken);


    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.resetPasswordToken = :resetToken WHERE u.email = :email")
    int updateResetPasswordToken(@Param("resetToken") String resetToken, @Param("email") String email);

    @Query("SELECT u FROM User u WHERE u.email = :emailOrUsername OR u.username = :emailOrUsername")
    Optional<User> findByEmailOrUsername(@Param("emailOrUsername") String emailOrUsername);
}
