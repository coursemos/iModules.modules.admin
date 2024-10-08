<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 권한 구조체를 정의한다.
 *
 * @file /modules/admin/dtos/Permission.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 10. 8.
 */
namespace modules\admin\dtos;
class Permission
{
    private object|bool $_permissions = false;

    /**
     * 새로운 관리자 권한 구조체를 가져온다.
     *
     * @return \modules\admin\dtos\Permission $permission
     */
    public static function init(): \modules\admin\dtos\Permission
    {
        return new \modules\admin\dtos\Permission();
    }

    /**
     * 권한범위를 특정 권한을 추가한다.
     *
     * @param \modules\admin\dtos\Scope $scope 추가할 권한범위
     * @param bool|array $permission 부여할 권한 (true : 해당 권한범위의 전체권한, array : 추가할 권한범위의 세부권한)
     * @return \modules\admin\dtos\Permission $this
     */
    public function addScope(?\modules\admin\dtos\Scope $scope, bool|array $permission): \modules\admin\dtos\Permission
    {
        if ($scope === null) {
            return $this;
        }

        $type = $scope->getComponent()->getType();
        $name = $scope->getComponent()->getName();
        $code = $scope->getCode();

        $permissions = new \stdClass();
        $permissions->{$type} = new \stdClass();
        $permissions->{$type}->{$name} = new \stdClass();

        if (is_array($permission) == true) {
            $permissions->{$type}->{$name}->{$code} = [];
            foreach ($permission as $child) {
                if (in_array($child, $scope->getChildCodes()) == true) {
                    $permissions->{$type}->{$name}->{$code}[] = $child;
                }
            }
        } else {
            $permissions->{$type}->{$name}->{$code} = $permission;
        }

        $this->merge($permissions);

        return $this;
    }

    /**
     * 권한범위코드로 권한을 추가한다.
     *
     * @param string $scopeCode 권한범위코드
     * @return \modules\admin\dtos\Permission $this
     */
    public function addScopeCode(string $scopeCode): \modules\admin\dtos\Permission
    {
        if (preg_match('/^(module|plugin|widget)\/([^:]+):?([^@]+)?@?(.*?)$/', $scopeCode, $matched) == true) {
            $type = $matched[1];
            $name = $matched[2];
            $code = $matched[3];
            $child = $matched[4];
            $component = \Component::get($type, $name);
            if ($component === null) {
                return $this;
            }

            if (strlen($code) == 0) {
                $this->addComponent($component);
                return $this;
            }

            $scope = $component->getAdmin()->getScope($code);
            if (strlen($child) == 0) {
                $this->addScope($scope, true);
            } else {
                $this->addScope($scope, [$child]);
            }
        }

        return $this;
    }

    /**
     * 컴포넌트 전체 관리자 권한을 추가한다.
     *
     * @param \Component $component 전체관리자 권한을 부여할 컴포넌트객체
     */
    public function addComponent(\Component $component): \modules\admin\dtos\Permission
    {
        $type = $component->getType();
        $name = $component->getName();
        $permissions = new \stdClass();
        $permissions->{$type} = new \stdClass();
        $permissions->{$type}->{$name} = true;

        $this->merge($permissions);

        return $this;
    }

    /**
     * 권한정보를 추가한다.
     *
     * @param object $permissions
     * @return \modules\admin\dtos\Permission $this
     */
    public function addPermissions(bool|object $permissions): \modules\admin\dtos\Permission
    {
        $this->merge($permissions);
        return $this;
    }

    /**
     * 최고관리자 권한으로 설정한다.
     *
     * @param bool $is_master 최고관리자여부
     * @return \modules\admin\dtos\Permission $this
     */
    public function setMaster(bool $is_master = true): \modules\admin\dtos\Permission
    {
        $this->_permissions = $is_master;
        return $this;
    }

    /**
     * 권한을 설정한다.
     *
     * @param bool|object $permissions
     * @return \modules\admin\dtos\Permission $this
     */
    public function setPermissions(bool|object $permissions): \modules\admin\dtos\Permission
    {
        $this->_permissions = $permissions;
        return $this;
    }

    /**
     * 설정된 전체 권한을 가져온다.
     *
     * @return bool|object $permissions
     */
    public function getPermissions(): bool|object
    {
        return $this->_permissions;
    }

    public function getJson(): object
    {
        $permissions = new \stdClass();

        foreach ($this->_permissions as $componentType => $componentNames) {
            foreach ($componentNames as $componentName => $scopes) {
                if ($scopes === true) {
                    $permissions->{$componentType . '/' . $componentName} = true;
                    continue;
                }

                foreach ($scopes as $scope => $children) {
                    if ($children === true) {
                        $permissions->{$componentType . '/' . $componentName . ':' . $scope} = true;
                        continue;
                    }

                    foreach ($children as $child) {
                        $permissions->{$componentType . '/' . $componentName . ':' . $scope . '@' . $child} = true;
                    }
                }
            }
        }

        return $permissions;
    }

    /**
     * 기존의 권한에 추가될 권한을 병합한다.
     *
     * @param object|bool $permissions 기존권한과 병합할 권한
     */
    private function merge(object|bool $permissions): void
    {
        if ($this->_permissions === true || $permissions === true) {
            $this->_permissions = true;
            return;
        }

        if ($permissions === false) {
            return;
        }

        if ($this->_permissions === false) {
            $this->_permissions = $permissions;
            return;
        }

        if ($this->_permissions === false) {
            $this->_permissions = new \stdClass();
        }

        foreach ($permissions as $componentType => $componentNames) {
            $this->_permissions->{$componentType} ??= new \stdClass();

            foreach ($componentNames as $componentName => $scopes) {
                $this->_permissions->{$componentType}->{$componentName} ??= new \stdClass();

                if ($this->_permissions->{$componentType}->{$componentName} === true || $scopes === true) {
                    $this->_permissions->{$componentType}->{$componentName} = true;
                    continue;
                }

                if (is_object($scopes) === true) {
                    foreach ($scopes as $scope => $children) {
                        $this->_permissions->{$componentType}->{$componentName}->{$scope} ??= [];

                        if (
                            $this->_permissions->{$componentType}->{$componentName}->{$scope} === true ||
                            $children === true
                        ) {
                            $this->_permissions->{$componentType}->{$componentName}->{$scope} = true;
                            continue;
                        }

                        if (is_array($children) === true) {
                            $this->_permissions->{$componentType}->{$componentName}->{$scope} = array_unique(
                                array_merge(
                                    $this->_permissions->{$componentType}->{$componentName}->{$scope},
                                    $children
                                )
                            );
                        }
                    }
                }
            }
        }
    }

    /**
     * 현재 권한에서 특정 권한을 제외한다.
     *
     * @param object|bool $permissions 제외할 권한
     */
    public function separate(object|bool $permissions): void
    {
        if ($permissions === true) {
            $this->_permissions = false;
            return;
        }

        if ($permissions === false) {
            return;
        }

        if ($this->_permissions === true || $this->_permissions === false) {
            return;
        }

        $uniqueComponentTypes = [];
        foreach ($permissions as $componentType => $componentNames) {
            $uniqueComponentNames = [];
            foreach ($componentNames as $componentName => $scopes) {
                if (($this->_permissions->{$componentType}?->{$componentName} ?? null) === null) {
                    continue;
                }

                if ($scopes === true) {
                    unset($this->_permissions->{$componentType}->{$componentName});
                    continue;
                }

                if ($this->_permissions->{$componentType}->{$componentName} === true) {
                    continue;
                }

                $uniqueScopes = [];
                if (is_object($scopes) === true) {
                    foreach ($scopes as $scope => $children) {
                        if (($this->_permissions->{$componentType}->{$componentName}->{$scope} ?? null) === null) {
                            continue;
                        }

                        if ($children === true) {
                            unset($this->_permissions->{$componentType}->{$componentName}->{$scope});
                            continue;
                        }

                        if ($this->_permissions->{$componentType}->{$componentName}->{$scope} === true) {
                            continue;
                        }

                        if (is_array($children) === true) {
                            $uniqueChildren = [];
                            foreach ($this->_permissions->{$componentType}->{$componentName}->{$scope} as $child) {
                                if (in_array($child, $children) === false) {
                                    $uniqueChildren[] = $child;
                                }
                            }

                            if (count($uniqueChildren) === 0) {
                                unset($this->_permissions->{$componentType}->{$componentName}->{$scope});
                                continue;
                            }

                            $this->_permissions->{$componentType}->{$componentName}->{$scope} = $uniqueChildren;
                            $uniqueScopes[] = $scope;
                        }
                    }
                }

                if (count($uniqueScopes) == 0) {
                    unset($this->_permissions->{$componentType}->{$componentName});
                    continue;
                }

                $uniqueComponentNames[] = $componentName;
            }

            if (count($uniqueComponentNames) == 0) {
                unset($this->_permissions->{$componentType});
                continue;
            }

            $uniqueComponentTypes[] = $componentType;
        }

        if (count($uniqueComponentTypes) == 0) {
            $this->_permissions = false;
        }
    }
}
