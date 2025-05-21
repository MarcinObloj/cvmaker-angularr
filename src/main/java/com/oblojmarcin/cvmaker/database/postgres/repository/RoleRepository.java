package com.oblojmarcin.cvmaker.database.postgres.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.oblojmarcin.cvmaker.database.postgres.entity.Roles;


@Repository
public interface RoleRepository extends JpaRepository<Roles,Integer> {
}
